// Escrow-style transaction routes.
const express = require("express");
const prisma = require("../prismaClient");
const { requireAuth, requireVerified } = require("../middleware/auth");
const paystack = require("../services/paystack");

const router = express.Router();

const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT || 5);

const RESERVED_TEST_TLDS = [".test", ".example", ".invalid", ".localhost"];
function paystackSafeEmail(email) {
  const lower = email.toLowerCase();
  for (const tld of RESERVED_TEST_TLDS) {
    if (lower.endsWith(tld)) {
      return email.slice(0, -tld.length) + ".ady-testaccount.com";
    }
  }
  return email;
}

router.post("/", requireAuth, requireVerified, async (req, res) => {
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

    const buyer = await prisma.user.findUnique({ where: { id: req.user.id } });

    const initResult = await paystack.initializeTransaction({
      email: paystackSafeEmail(buyer.email),
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

async function releaseTransactionFunds(transactionId) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { seller: true },
  });

  if (!transaction) throw new Error("Transaction not found");

  if (!transaction.providerSubaccount) {
    console.warn(
      `Transaction ${transactionId}: no subaccount on file for seller — manual transfer path not yet implemented.`
    );
  }

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { status: "RELEASED", releasedAt: new Date() },
  });
}

async function refundTransactionToBuyer(transactionId) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) throw new Error("Transaction not found");
  if (!["HELD", "DISPUTED"].includes(transaction.status)) {
    throw new Error(`Cannot refund — transaction is ${transaction.status}`);
  }
  if (!transaction.providerReference) {
    throw new Error("This transaction has no payment reference to refund");
  }

  await paystack.refundTransaction(transaction.providerReference, transaction.totalAmount);

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { status: "REFUNDED", refundedAt: new Date() },
  });
}

module.exports = router;
module.exports.releaseTransactionFunds = releaseTransactionFunds;
module.exports.refundTransactionToBuyer = refundTransactionToBuyer;