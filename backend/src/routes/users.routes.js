const express = require("express");
const prisma = require("../prismaClient");
const { requireAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

function publicProfile(user) {
  // Deliberately excludes matric number, phone, email, department/faculty
  // details are shown, but contact info stays private per the trust model
  // in the product brief: public profile shows identity + reputation only.
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
  };
}

// GET /api/users/:id — public seller profile
router.get("/:id", async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: publicProfile(user) });
});

// PATCH /api/users/me — update own profile
router.patch("/me/update", requireAuth, upload.single("avatar"), async (req, res) => {
  try {
    const { name, phone, department, faculty, bio } = req.body;
    const data = { name, phone, department, faculty, bio };
    Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);
    if (req.file) {
      data.avatarUrl = `/uploads/${req.file.filename}`;
    }
    const user = await prisma.user.update({ where: { id: req.user.id }, data });
    const { passwordHash, resetToken, resetTokenExpires, ...safe } = user;
    res.json({ user: safe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update profile" });
  }
});

module.exports = router;
