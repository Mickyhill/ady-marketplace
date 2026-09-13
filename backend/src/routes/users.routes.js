const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const prisma = require("../prismaClient");
const { requireAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { getBadges } = require("../utils/trust");

const router = express.Router();

function publicProfile(user, badges) {
  // Deliberately excludes matric number, phone, email, department/faculty
  // details are shown, but contact info stays private per the trust model
  // in the product brief: public profile shows identity + reputation only.
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
    badges, // { phoneVerified, aksuVerified, identityVerified, trustedSeller, trust }
  };
}

// GET /api/users/:id — public seller profile
router.get("/:id", async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: "User not found" });
  const unresolvedDisputes = await prisma.dispute.count({
    where: { sellerId: user.id, status: "OPEN" },
  });
  res.json({ user: publicProfile(user, getBadges(user, unresolvedDisputes)) });
});

// PATCH /api/users/me — update own profile
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

// DELETE /api/users/me — self-service account deletion. Anonymizes personal
// data rather than hard-deleting the row, since messages, reviews, and
// transactions reference this user and shouldn't disappear for the OTHER
// party involved. Blocked while the user has an open dispute or money
// actively held in escrow, so a deletion can't be used to dodge a dispute.
//
// NOTE: existing JWTs stay valid until their natural 7-day expiry even
// after deletion (requireAuth only checks the token's signature, not a
// live DB lookup, for performance) — a known, small residual-access
// window, not a silent gap.
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

    // Take their active listings off the market — sold ones stay, for the
    // buyer's own record and any pending review, just showing "Deleted User".
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
