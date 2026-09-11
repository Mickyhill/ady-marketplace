const express = require("express");
const prisma = require("../prismaClient");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { getBadges, computeRiskLevel } = require("../utils/trust");

const router = express.Router();

router.use(requireAuth, requireAdmin);

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  const [users, verifiedUsers, activeListings, soldListings, unresolvedReports, openDisputes] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { verificationStatus: "VERIFIED" } }),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { status: "SOLD" } }),
    prisma.report.count({ where: { resolved: false } }),
    prisma.dispute.count({ where: { status: "OPEN" } }),
  ]);
  res.json({ users, verifiedUsers, activeListings, soldListings, unresolvedReports, openDisputes });
});

// GET /api/admin/users — includes computed badges + admin-only risk level
router.get("/users", async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, role: true, verificationStatus: true,
      phoneVerified: true, identityVerified: true, rating: true, ratingCount: true,
      department: true, faculty: true, matricNumber: true, studentIdPhotoUrl: true, createdAt: true,
    },
  });

  // Tally unresolved reports and open disputes per seller in one pass each,
  // rather than one query per user (this dataset is small for now, but
  // still worth avoiding an N+1 pattern from the start).
  const [unresolvedReports, openDisputes] = await Promise.all([
    prisma.report.findMany({ where: { resolved: false }, select: { listing: { select: { sellerId: true } } } }),
    prisma.dispute.findMany({ where: { status: "OPEN" }, select: { sellerId: true } }),
  ]);
  const reportCounts = {};
  unresolvedReports.forEach((r) => {
    const id = r.listing.sellerId;
    reportCounts[id] = (reportCounts[id] || 0) + 1;
  });
  const disputeCounts = {};
  openDisputes.forEach((d) => {
    disputeCounts[d.sellerId] = (disputeCounts[d.sellerId] || 0) + 1;
  });

  const enriched = users.map((u) => {
    const accountAgeDays = (Date.now() - new Date(u.createdAt).getTime()) / 86400000;
    const unresolvedDisputesAgainst = disputeCounts[u.id] || 0;
    return {
      ...u,
      badges: getBadges(u, unresolvedDisputesAgainst),
      risk: computeRiskLevel({
        user: u,
        unresolvedReportsAgainst: reportCounts[u.id] || 0,
        unresolvedDisputesAgainst,
        accountAgeDays,
      }).level, // only the level (LOW/NORMAL/REVIEW/HIGH) leaves this endpoint, never the raw score
    };
  });

  res.json({ users: enriched });
});

// PATCH /api/admin/users/:id/verify — { status: "VERIFIED" | "REJECTED" }  (drives "AKSU Verified" badge)
router.patch("/users/:id/verify", async (req, res) => {
  const { status } = req.body;
  if (!["VERIFIED", "REJECTED", "PENDING", "UNVERIFIED"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { verificationStatus: status },
  });
  res.json({ user: { id: user.id, verificationStatus: user.verificationStatus } });
});

// PATCH /api/admin/users/:id/phone — { verified: true|false }  ("Phone Verified" badge — manual until Phase 2's real OTP)
router.patch("/users/:id/phone", async (req, res) => {
  const { verified } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { phoneVerified: Boolean(verified) },
  });
  res.json({ user: { id: user.id, phoneVerified: user.phoneVerified } });
});

// PATCH /api/admin/users/:id/identity — { verified: true|false }  ("Identity Verified" badge)
router.patch("/users/:id/identity", async (req, res) => {
  const { verified } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { identityVerified: Boolean(verified) },
  });
  res.json({ user: { id: user.id, identityVerified: user.identityVerified } });
});

// GET /api/admin/listings — every listing regardless of status
router.get("/listings", async (req, res) => {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    include: { seller: { select: { id: true, name: true, email: true } }, category: true, images: true },
  });
  res.json({ listings });
});

// PATCH /api/admin/listings/:id/status — { status: "ACTIVE" | "REMOVED" | ... }
router.patch("/listings/:id/status", async (req, res) => {
  const { status } = req.body;
  if (!["ACTIVE", "SOLD", "REMOVED", "PENDING_REVIEW"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const listing = await prisma.listing.update({ where: { id: req.params.id }, data: { status } });
  res.json({ listing });
});

// PATCH /api/admin/listings/:id/feature — { featured: true|false }
router.patch("/listings/:id/feature", async (req, res) => {
  const { featured } = req.body;
  const listing = await prisma.listing.update({
    where: { id: req.params.id },
    data: { featured: Boolean(featured) },
  });
  res.json({ listing });
});

// PATCH /api/admin/listings/:id/inspect — { inspected: true|false }  ("Item Inspected" badge —
// deliberately SEPARATE from any seller-verification field; a verified student is not the same
// claim as a verified item, see the schema comment on Listing.itemVerified)
router.patch("/listings/:id/inspect", async (req, res) => {
  const { inspected } = req.body;
  const listing = await prisma.listing.update({
    where: { id: req.params.id },
    data: { itemVerified: Boolean(inspected) },
  });
  res.json({ listing });
});

// GET /api/admin/reports
router.get("/reports", async (req, res) => {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      listing: { select: { id: true, title: true, status: true } },
      reporter: { select: { id: true, name: true, email: true } },
    },
  });
  res.json({ reports });
});

// PATCH /api/admin/reports/:id/resolve
router.patch("/reports/:id/resolve", async (req, res) => {
  const report = await prisma.report.update({ where: { id: req.params.id }, data: { resolved: true } });
  res.json({ report });
});

// GET /api/admin/disputes — full context for each open dispute: listing,
// both accounts, and the message thread between them about that listing.
router.get("/disputes", async (req, res) => {
  const disputes = await prisma.dispute.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      listing: { select: { id: true, title: true, price: true, status: true, images: true } },
      buyer: { select: { id: true, name: true, email: true } },
      seller: { select: { id: true, name: true, email: true } },
    },
  });

  // Attach the relevant message thread for each dispute so the admin doesn't
  // have to go dig through Messages separately.
  const withMessages = await Promise.all(
    disputes.map(async (d) => {
      const messages = await prisma.message.findMany({
        where: {
          listingId: d.listingId,
          OR: [
            { senderId: d.buyerId, receiverId: d.sellerId },
            { senderId: d.sellerId, receiverId: d.buyerId },
          ],
        },
        orderBy: { createdAt: "asc" },
      });
      return { ...d, messages };
    })
  );

  res.json({ disputes: withMessages });
});

// PATCH /api/admin/disputes/:id/resolve — { status: "RESOLVED" | "REJECTED" }
router.patch("/disputes/:id/resolve", async (req, res) => {
  const { status } = req.body;
  if (!["RESOLVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const dispute = await prisma.dispute.update({ where: { id: req.params.id }, data: { status } });
  res.json({ dispute });
});

module.exports = router;
