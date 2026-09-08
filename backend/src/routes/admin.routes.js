const express = require("express");
const prisma = require("../prismaClient");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth, requireAdmin);

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  const [users, verifiedUsers, activeListings, soldListings, unresolvedReports] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { verificationStatus: "VERIFIED" } }),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { status: "SOLD" } }),
    prisma.report.count({ where: { resolved: false } }),
  ]);
  res.json({ users, verifiedUsers, activeListings, soldListings, unresolvedReports });
});

// GET /api/admin/users
router.get("/users", async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, role: true, verificationStatus: true,
      department: true, faculty: true, matricNumber: true, createdAt: true,
    },
  });
  res.json({ users });
});

// PATCH /api/admin/users/:id/verify — { status: "VERIFIED" | "REJECTED" }
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

module.exports = router;
