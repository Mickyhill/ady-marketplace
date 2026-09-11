// Escrow-style transaction routes.
//
// "Buyer confirms item received" (POST /:id/confirm-received below) is its
// own quick action, separate from Phase 1's review flow (POST /api/reviews)
// — confirming releases the seller's funds; leaving a review is optional,
// richer feedback afterward. They're independent by design, matching the
// original spec's distinction between transaction confirmation and
// reputation/reviews.

const express = require("express");
const prisma = require("../prismaClient");
const { requireAuth } = require("../middleware/auth");
const paystack = require("../services/paystack");

const router = express.Router();

const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT || 5);

// POST /api/transactions
// Buyer initiates payment for a listing.
router.post("/", requireAuth, async (req, res) => {
  try {
    const { listingId } = req.body;
    if (!listingId) {
      return res.status(400).json({ error: "listingId is required" });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: true },
    });

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    if (listing.status !== "ACTIVE") {
      return res.status(400).json({ error: "This listing is not available for purchase" });
    }
    if (listing.seller.id === req.user.id) {
      return res.status(400).json({ error: "You cannot buy your own listing" });
    }

    const itemAmountKobo = Math.round(listing.price * 100);
    const platformFeeKobo = Math.round(itemAmountKobo * (PLATFORM_FEE_PERCENT / 100));
    const totalAmountKobo = itemAmountKobo + platformFeeKobo;

    const transaction = await prisma.transaction.create({
      data: {
        listingId: listing.id,
        buyerId: req.user.id,
        sellerId: listing.seller.id,
        itemAmount: itemAmountKobo,
        platformFee: platformFeeKobo,
        totalAmount: totalAmountKobo,
        status: "PENDING",
      },
    });

    // Look up whether the seller has a Paystack subaccount set up yet
    // (User.paystackSubaccountCode — set once a seller completes onboarding).
    const buyer = await prisma.user.findUnique({ where: { id: req.user.id } });

    const initResult = await paystack.initializeTransaction({
      email: buyer.email,
      amountKobo: totalAmountKobo,
      reference: transaction.id,
      subaccountCode: listing.seller.paystackSubaccountCode || undefined,
      platformFeeKobo: listing.seller.paystackSubaccountCode ? platformFeeKobo : undefined,
      callbackUrl: `${process.env.FRONTEND_URL}/transactions/${transaction.id}/callback`,
    });

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { providerReference: transaction.id },
    });

    return res.json({
      transaction,
      authorizationUrl: initResult.data.authorization_url,
    });
  } catch (err) {
    console.error("create transaction error:", err);
    return res.status(500).json({ error: "Failed to initiate payment" });
  }
});

// GET /api/transactions/mine/:listingId — the logged-in user's own transaction
// for this listing, if one exists (lets the frontend show "Buy Now" vs
// "Payment held, confirm receipt" vs "Released" without needing the
// transaction's own id up front).
router.get("/mine/:listingId", requireAuth, async (req, res) => {
  const transaction = await prisma.transaction.findFirst({
    where: {
      listingId: req.params.listingId,
      OR: [{ buyerId: req.user.id }, { sellerId: req.user.id }],
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ transaction });
});

// GET /api/transactions/:id
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id },
      include: { listing: true },
    });
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    if (transaction.buyerId !== req.user.id && transaction.sellerId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to view this transaction" });
    }
    return res.json(transaction);
  } catch (err) {
    console.error("get transaction error:", err);
    return res.status(500).json({ error: "Failed to fetch transaction" });
  }
});

// POST /api/transactions/:id/confirm-received
// PHASE1_ASSUMPTION: this duplicates what should eventually be part of
// Phase 1's review-confirmation flow. When that lands, call
// releaseTransactionFunds(transactionId) from there instead, and remove
// (or keep as an internal-only fallback) this route.
router.post("/:id/confirm-received", requireAuth, async (req, res) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id },
    });
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    if (transaction.buyerId !== req.user.id) {
      return res.status(403).json({ error: "Only the buyer can confirm receipt" });
    }
    if (transaction.status !== "HELD") {
      return res.status(400).json({ error: `Cannot confirm — transaction is ${transaction.status}` });
    }

    await releaseTransactionFunds(transaction.id);

    return res.json({ message: "Funds released to seller" });
  } catch (err) {
    console.error("confirm-received error:", err);
    return res.status(500).json({ error: "Failed to confirm receipt" });
  }
});

// POST /api/transactions/:id/dispute — buyer or seller disputes a paid, held transaction
router.post("/:id/dispute", requireAuth, async (req, res) => {
  try {
    const { reason, details } = req.body;
    if (!reason) {
      return res.status(400).json({ error: "reason is required" });
    }
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id },
    });
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    if (transaction.buyerId !== req.user.id && transaction.sellerId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }
    if (transaction.status !== "HELD") {
      return res.status(400).json({ error: `Cannot dispute — transaction is ${transaction.status}` });
    }

    const dispute = await prisma.dispute.create({
      data: {
        listingId: transaction.listingId,
        reason,
        details,
        buyerId: transaction.buyerId,
        sellerId: transaction.sellerId,
      },
    });

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "DISPUTED", disputeId: dispute.id },
    });

    return res.json({ message: "Transaction disputed. Funds held pending admin review.", dispute });
  } catch (err) {
    console.error("dispute transaction error:", err);
    return res.status(500).json({ error: "Failed to dispute transaction" });
  }
});

/**
 * Release held funds to the seller. Called from POST /:id/confirm-received
 * above (buyer-initiated), or from an admin action after resolving a
 * dispute in the seller's favor (see admin.routes.js
 * PATCH /admin/disputes/:id/release-funds).
 *
 * NOTE: there is currently no equivalent refundTransaction() for ruling in
 * the BUYER's favor — that needs Paystack's refund API wired into
 * services/paystack.js. Flagged here rather than half-built silently.
 */
async function releaseTransactionFunds(transactionId) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { seller: true },
  });

  if (!transaction) throw new Error("Transaction not found");

  // If the seller had a subaccount, Paystack already split the funds at
  // payment time — "release" here just means marking our own records.
  // If NOT (manual-transfer fallback path), this is where we'd actually
  // call paystack.initiateTransfer() to pay the seller. Left as a TODO
  // since it depends on whether the seller has bank details on file yet —
  // build this once the owner confirms the payout model (subaccount vs
  // manual transfer) they want to use.
  if (!transaction.providerSubaccount) {
    console.warn(
      `Transaction ${transactionId}: no subaccount on file for seller — ` +
      `manual transfer path not yet implemented. Funds are marked ` +
      `released in our records but a real payout call is still needed.`
    );
    // TODO: paystack.initiateTransfer(...) once payout model is confirmed
  }

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { status: "RELEASED", releasedAt: new Date() },
  });
}

module.exports = router;
module.exports.releaseTransactionFunds = releaseTransactionFunds;
