const express = require("express");
const prisma = require("../prismaClient");
const { requireAuth } = require("../middleware/auth");
const paystack = require("../services/paystack");

const router = express.Router();

// Simple flat pricing — configurable via env, defaults to ₦100/day.
const PRICE_PER_DAY_KOBO = parseInt(process.env.BOOST_PRICE_PER_DAY_KOBO || "10000", 10);
const ALLOWED_DURATIONS = [3, 7, 14];

// POST /api/boosts — seller pays to promote their own listing into the
// Featured section for a set number of days.
router.post("/", requireAuth, async (req, res) => {
  try {
    const { listingId, durationDays } = req.body;
    if (!listingId || !ALLOWED_DURATIONS.includes(Number(durationDays))) {
      return res.status(400).json({ error: `durationDays must be one of: ${ALLOWED_DURATIONS.join(", ")}` });
    }
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.sellerId !== req.user.id) {
      return res.status(403).json({ error: "You can only boost your own listings" });
    }
    if (listing.status !== "ACTIVE") {
      return res.status(400).json({ error: "Only active listings can be boosted" });
    }

    const amountKobo = PRICE_PER_DAY_KOBO * Number(durationDays);
    const boost = await prisma.listingBoost.create({
      data: {
        listingId,
        sellerId: req.user.id,
        amountKobo,
        durationDays: Number(durationDays),
        providerReference: "", // set below once we have the boost's own id
      },
    });
    // Paystack needs a reference up front, and we want it to match our own
    // row's id (same pattern as Transaction) — update it in a second step
    // since Prisma can't reference a not-yet-created id inside its own create.
    await prisma.listingBoost.update({ where: { id: boost.id }, data: { providerReference: boost.id } });

    const seller = await prisma.user.findUnique({ where: { id: req.user.id } });
    const paymentData = await paystack.initializeTransaction({
      email: seller.email,
      amountKobo,
      reference: boost.id,
      callbackUrl: `${process.env.FRONTEND_URL}/my-listings`,
    });

    res.status(201).json({
      boostId: boost.id,
      authorizationUrl: paymentData.data.authorization_url,
    });
  } catch (err) {
    console.error("create boost error:", err);
    res.status(500).json({ error: err.message || "Could not start boost payment" });
  }
});

module.exports = router;