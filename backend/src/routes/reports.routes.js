const express = require("express");
const prisma = require("../prismaClient");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// POST /api/reports — report a listing
router.post("/", requireAuth, async (req, res) => {
  try {
    const { listingId, reason, details } = req.body;
    if (!listingId || !reason) {
      return res.status(400).json({ error: "listingId and reason are required" });
    }
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const report = await prisma.report.create({
      data: { listingId, reason, details, reporterId: req.user.id },
    });
    res.status(201).json({ report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not file report" });
  }
});

module.exports = router;
