const express = require("express");
const prisma = require("../prismaClient");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// POST /api/reviews — buyer confirms "item received" + rates the transaction
router.post("/", requireAuth, async (req, res) => {
  try {
    const { listingId, itemMatched, communication, experience, comment } = req.body;
    if (!listingId || itemMatched === undefined || !communication || !experience) {
      return res.status(400).json({ error: "listingId, itemMatched, communication and experience are required" });
    }
    if (communication < 1 || communication > 5 || experience < 1 || experience > 5) {
      return res.status(400).json({ error: "communication and experience must be between 1 and 5" });
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.sellerId === req.user.id) {
      return res.status(400).json({ error: "You can't review your own listing" });
    }

    // Require that the reviewer actually messaged the seller about this
    // listing — the closest signal we have to "this was a real transaction"
    // without a formal order/checkout system in place yet.
    const hasMessaged = await prisma.message.findFirst({
      where: { listingId, senderId: req.user.id, receiverId: listing.sellerId },
    });
    if (!hasMessaged) {
      return res.status(403).json({ error: "You can only review listings you've messaged the seller about" });
    }

    const existing = await prisma.review.findFirst({ where: { listingId, reviewerId: req.user.id } });
    if (existing) {
      return res.status(409).json({ error: "You've already reviewed this listing" });
    }

    const review = await prisma.review.create({
      data: {
        listingId,
        reviewerId: req.user.id,
        sellerId: listing.sellerId,
        itemMatched: Boolean(itemMatched),
        communication: parseInt(communication, 10),
        experience: parseInt(experience, 10),
        comment,
      },
    });

    // Recompute the seller's aggregate rating from every review they've received.
    const sellerReviews = await prisma.review.findMany({ where: { sellerId: listing.sellerId } });
    const avg =
      sellerReviews.reduce((sum, r) => sum + (r.communication + r.experience) / 2, 0) / sellerReviews.length;
    await prisma.user.update({
      where: { id: listing.sellerId },
      data: { rating: avg, ratingCount: sellerReviews.length },
    });

    res.status(201).json({ review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not submit review" });
  }
});

// GET /api/reviews/seller/:sellerId — public reviews for a seller's profile
router.get("/seller/:sellerId", async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { sellerId: req.params.sellerId },
    orderBy: { createdAt: "desc" },
    include: {
      reviewer: { select: { id: true, name: true, avatarUrl: true } },
      listing: { select: { id: true, title: true } },
    },
  });
  res.json({ reviews });
});

module.exports = router;
