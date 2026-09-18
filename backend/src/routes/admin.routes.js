const express = require("express");
const prisma = require("../prismaClient");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { getBadges, computeRiskLevel } = require("../utils/trust");
const { releaseTransactionFunds, refundTransactionToBuyer } = require("./transactions.routes");

const router = express.Router();

router.use(requireAuth, requireAdmin);

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
      }).level,
    };
  });

  res.json({ users: enriched });
});

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

router.patch("/users/:id/phone", async (req, res) => {
  const { verified } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { phoneVerified: Boolean(verified) },
  });
  res.json({ user: { id: user.id, phoneVerified: user.phoneVerified } });
});

router.patch("/users/:id/identity", async (req, res) => {
  const { verified } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { identityVerified: Boolean(verified) },
  });
  res.json({ user: { id: user.id, identityVerified: user.identityVerified } });
});

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

router.get("/listings", async (req, res) => {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    include: { seller: { select: { id: true, name: true, email: true } }, category: true, images: true },
  });
  res.json({ listings });
});

router.patch("/listings/:id/status", async (req, res) => {
  const { status } = req.body;
  if (!["ACTIVE", "SOLD", "REMOVED", "PENDING_REVIEW"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const listing = await prisma.listing.update({ where: { id: req.params.id }, data: { status } });
  res.json({ listing });
});

router.patch("/listings/:id/feature", async (req, res) => {
  const { featured } = req.body;
  const listing = await prisma.listing.update({
    where: { id: req.params.id },
    data: { featured: Boolean(featured) },
  });
  res.json({ listing });
});

router.patch("/listings/:id/inspect", async (req, res) => {
  const { inspected } = req.body;
  const listing = await prisma.listing.update({
    where: { id: req.params.id },
    data: { itemVerified: Boolean(inspected) },
  });
  res.json({ listing });
});

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

router.patch("/reports/:id/resolve", async (req, res) => {
  const report = await prisma.report.update({ where: { id: req.params.id }, data: { resolved: true } });
  res.json({ report });
});

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

router.patch("/disputes/:id/resolve", async (req, res) => {
  const { status } = req.body;
  if (!["RESOLVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const dispute = await prisma.dispute.update({ where: { id: req.params.id }, data: { status } });
  res.json({ dispute });
});

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

router.patch("/risk-flags/:id/resolve", async (req, res) => {
  const flag = await prisma.riskFlag.update({ where: { id: req.params.id }, data: { resolved: true } });
  res.json({ flag });
});

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

router.patch("/disputes/:id/refund-buyer", async (req, res) => {
  try {
    const dispute = await prisma.dispute.findUnique({
      where: { id: req.params.id },
      include: { transaction: true },
    });
    if (!dispute) return res.status(404).json({ error: "Dispute not found" });
    if (!dispute.transaction) {
      return res.status(400).json({ error: "This dispute has no linked payment to refund" });
    }
    await refundTransactionToBuyer(dispute.transaction.id);
    res.json({ message: "Funds refunded to buyer" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Could not refund buyer" });
  }
});

module.exports = router;