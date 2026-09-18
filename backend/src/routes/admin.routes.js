const express = require("express");
const prisma = require("../prismaClient");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { getBadges, computeRiskLevel } = require("../utils/trust");
const { releaseTransactionFunds } = require("./transactions.routes");

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

// GET /api/admin/users — includes computed badges + admin-only risk level,
// plus who verified this user and when (audit trail).
router.get("/users", async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, role: true, verificationStatus: true,
      phoneVerified: true, identityVerified: true, rating: true, ratingCount: true,
      department: true, faculty: true, matricNumber: true, studentPortalScreenshotUrl: true, createdAt: true,
      verifiedAt: true,
      verifiedBy: { select: { id: true, name: true, email: true } },
    },
  });

  // Tally unresolved reports, open disputes, and unresolved risk flags per
  // user in one pass each, rather than one query per user.
  const [unresolvedReports, openDisputes, unresolvedFlags] = await Promise.all([
    prisma.report.findMany({ where: { resolved: false }, select: { listing: { select: { sellerId: true } } } }),
    prisma.dispute.findMany({ where: { status: "OPEN" }, select: { sellerId: true } }),
    prisma.riskFlag.findMany({ where: { resolved: false, userId: { not: null } }, select: { userId: true, severity: true } }),
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
  const flagCounts = {};
  unresolvedFlags.forEach((f) => {
    if (!flagCounts[f.userId]) flagCounts[f.userId] = { yellow: 0, red: 0 };
    if (f.severity === "RED") flagCounts[f.userId].red += 1;
    else flagCounts[f.userId].yellow += 1;
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
        unresolvedRiskFlags: flagCounts[u.id] || { yellow: 0, red: 0 },
      }).level, // only the level (LOW/NORMAL/REVIEW/HIGH) leaves this endpoint, never the raw score
    };
  });

  res.json({ users: enriched });
});

// PATCH /api/admin/users/:id/verify — { status: "VERIFIED" | "REJECTED" }  (drives "AKSU Verified" badge)
// Also records WHICH admin verified this user and WHEN, whenever status is
// set to VERIFIED — an audit trail, with zero extra clicks for the admin.
router.patch("/users/:id/verify", async (req, res) => {
  const { status } = req.body;
  if (!["VERIFIED", "REJECTED", "PENDING", "UNVERIFIED"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const data = { verificationStatus: status };
  if (status === "VERIFIED") {
    data.verifiedById = req.user.id;
    data.verifiedAt = new Date();
  }
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data,
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

// PATCH /api/admin/users/:id/role — { role: "ADMIN" | "STUDENT" }
// Lets an existing admin promote a trusted user to admin, or demote one
// back to a regular student — so verification duties don't rest on one
// single person. An admin can't demote themselves, so nobody accidentally
// locks themselves out of the dashboard with no other admin around.
router.patch("/users/:id/role", async (req, res) => {
  const { role } = req.body;
  if (!["ADMIN", "STUDENT"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  if (req.params.id === req.user.id && role !== "ADMIN") {
    return res.status(400).json({ error: "You can't remove your own admin access" });
  }
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
  });
  res.json({ user: { id: user.id, role: user.role } });
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
      transaction: { select: { id: true, status: true, totalAmount: true } },
    },
  });

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

// GET /api/admin/risk-flags — automated Phase 2 fraud signals (device/photo)
router.get("/risk-flags", async (req, res) => {
  const flags = await prisma.riskFlag.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      listing: { select: { id: true, title: true } },
    },
  });
  res.json({ flags });
});

// PATCH /api/admin/risk-flags/:id/resolve
router.patch("/risk-flags/:id/resolve", async (req, res) => {
  const flag = await prisma.riskFlag.update({ where: { id: req.params.id }, data: { resolved: true } });
  res.json({ flag });
});

// PATCH /api/admin/disputes/:id/release-funds — explicit admin action to
// release a disputed transaction's held funds to the seller. Deliberately
// a separate, explicit click rather than something triggered automatically
// by changing the dispute's status — this moves real money.
router.patch("/disputes/:id/release-funds", async (req, res) => {
  try {
    const dispute = await prisma.dispute.findUnique({
      where: { id: req.params.id },
      include: { transaction: true },
    });
    if (!dispute) return res.status(404).json({ error: "Dispute not found" });
    if (!dispute.transaction) {
      return res.status(400).json({ error: "This dispute has no linked payment to release" });
    }
    await releaseTransactionFunds(dispute.transaction.id);
    res.json({ message: "Funds released to seller" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not release funds" });
  }
});

module.exports = router;