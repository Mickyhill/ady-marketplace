const express = require("express");
const prisma = require("../prismaClient");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// POST /api/disputes — buyer opens a dispute about a specific transaction
router.post("/", requireAuth, async (req, res) => {
  try {
    const { listingId, reason, details } = req.body;
    if (!listingId || !reason) {
      return res.status(400).json({ error: "listingId and reason are required" });
    }
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.sellerId === req.user.id) {
      return res.status(400).json({ error: "You can't open a dispute against your own listing" });
    }

    const dispute = await prisma.dispute.create({
      data: {
        listingId,
        reason,
        details,
        buyerId: req.user.id,
        sellerId: listing.sellerId,
      },
    });
    res.status(201).json({ dispute });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not open dispute" });
  }
});

// GET /api/disputes/mine — the logged-in user's own disputes (filed or against them)
router.get("/mine", requireAuth, async (req, res) => {
  const disputes = await prisma.dispute.findMany({
    where: { OR: [{ buyerId: req.user.id }, { sellerId: req.user.id }] },
    orderBy: { createdAt: "desc" },
    include: { listing: { select: { id: true, title: true } } },
  });
  res.json({ disputes });
});

module.exports = router;
