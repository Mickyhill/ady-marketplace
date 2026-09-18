const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const prisma = require("../prismaClient");
const { requireAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { getBadges } = require("../utils/trust");
const paystack = require("../services/paystack");

const router = express.Router();

function publicProfile(user, badges) {
  if (user.deletedAt) {
    return {
      id: user.id,
      name: "Deleted User",
      department: null,
      faculty: null,
      avatarUrl: null,
      bio: null,
      verificationStatus: "UNVERIFIED",
      rating: user.rating,
      ratingCount: user.ratingCount,
      createdAt: user.createdAt,
      badges: { phoneVerified: false, aksuVerified: false, identityVerified: false, trustedSeller: false, trust: { score: 0, tier: "New" } },
      deleted: true,
    };
  }
  return {
    id: user.id,
    name: user.name,
    department: user.department,
    faculty: user.faculty,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    verificationStatus: user.verificationStatus,
    rating: user.rating,
    ratingCount: user.ratingCount,
    createdAt: user.createdAt,
    badges,
  };
}

// GET /api/users/me/payout — current payout account status. Mounted before
// /:id so "me" is never mistaken for a user id.
router.get("/me/payout", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json({ hasPayoutAccount: !!user.paystackSubaccountCode });
});

// GET /api/users/me/banks — Nigerian bank list for the payout form's dropdown
router.get("/me/banks", requireAuth, async (req, res) => {
  try {
    const result = await paystack.listBanks();
    res.json({ banks: result.data.map((b) => ({ name: b.name, code: b.code })) });
  } catch (err) {
    console.error("list banks error:", err);
    res.status(500).json({ error: "Could not load bank list" });
  }
});

// POST /api/users/me/payout — connect a bank account for automatic payouts.
router.post("/me/payout", requireAuth, async (req, res) => {
  try {
    const { businessName, bankCode, accountNumber } = req.body;
    if (!businessName || !bankCode || !accountNumber) {
      return res.status(400).json({ error: "Account holder name, bank, and account number are all required" });
    }
    const result = await paystack.createSubaccount({
      businessName,
      bankCode,
      accountNumber,
      percentageCharge: Number(process.env.PLATFORM_FEE_PERCENT || 5),
    });
    await prisma.user.update({
      where: { id: req.user.id },
      data: { paystackSubaccountCode: result.data.subaccount_code },
    });
    res.json({ message: "Payout account connected! Future sales will pay out to this account automatically." });
  } catch (err) {
    console.error("payout setup error:", err);
    res.status(500).json({ error: err.message || "Could not connect payout account. Double check your account number and bank." });
  }
});

// GET /api/users/:id — public seller profile
router.get("/:id", async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: "User not found" });
  const unresolvedDisputes = await prisma.dispute.count({
    where: { sellerId: user.id, status: "OPEN" },
  });
  res.json({ user: publicProfile(user, getBadges(user, unresolvedDisputes)) });
});

// PATCH /api/users/me/update — update own profile
router.patch("/me/update", requireAuth, upload.single("avatar"), async (req, res) => {
  try {
    const { name, phone, department, faculty, bio } = req.body;
    const data = { name, phone, department, faculty, bio };
    Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);
    if (req.file) {
      data.avatarUrl = req.file.path;
    }
    const user = await prisma.user.update({ where: { id: req.user.id }, data });
    const unresolvedDisputes = await prisma.dispute.count({
      where: { sellerId: user.id, status: "OPEN" },
    });
    const { passwordHash, resetToken, resetTokenExpires, ...safe } = user;
    res.json({ user: { ...safe, badges: getBadges(user, unresolvedDisputes) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update profile" });
  }
});

// DELETE /api/users/me — self-service account deletion.
router.delete("/me", requireAuth, async (req, res) => {
  try {
    const [openDispute, heldTransaction] = await Promise.all([
      prisma.dispute.findFirst({
        where: { OR: [{ buyerId: req.user.id }, { sellerId: req.user.id }], status: "OPEN" },
      }),
      prisma.transaction.findFirst({
        where: { OR: [{ buyerId: req.user.id }, { sellerId: req.user.id }], status: { in: ["HELD", "DISPUTED"] } },
      }),
    ]);
    if (openDispute) {
      return res.status(400).json({ error: "You have an open dispute — it must be resolved before you can delete your account" });
    }
    if (heldTransaction) {
      return res.status(400).json({ error: "You have a payment currently held in escrow — it must be released or refunded first" });
    }

    const unusablePasswordHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: "Deleted User",
        email: `deleted-${req.user.id}@adymarketplace.invalid`,
        phone: null,
        department: null,
        faculty: null,
        matricNumber: null,
        studentPortalScreenshotUrl: null,
        avatarUrl: null,
        bio: null,
        passwordHash: unusablePasswordHash,
        resetToken: null,
        resetTokenExpires: null,
        phoneVerified: false,
        identityVerified: false,
        verificationStatus: "UNVERIFIED",
        deletedAt: new Date(),
      },
    });

    await prisma.listing.updateMany({
      where: { sellerId: req.user.id, status: "ACTIVE" },
      data: { status: "REMOVED" },
    });

    res.json({ message: "Account deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete account" });
  }
});

module.exports = router;