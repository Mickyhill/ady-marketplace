const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../prismaClient");
const { requireAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { getBadges } = require("../utils/trust");

const router = express.Router();

// AKSU matric number format: AK<2-digit admission year>/<faculty code>/<dept
// code>/<3-digit serial>, e.g. "AK20/ENG/MEC/001". Case-insensitive. This
// only checks the *shape* is plausible — it does not confirm the number
// belongs to a real enrolled student (see the register route's comment).
const MATRIC_NUMBER_PATTERN = /^AK\d{2}\/[A-Za-z]{2,6}\/[A-Za-z]{2,6}\/\d{2,5}$/i;

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function publicUser(user, badges) {
  const { passwordHash, resetToken, resetTokenExpires, ...safe } = user;
  return { ...safe, badges };
}

// POST /api/auth/register
// Expects multipart/form-data (not JSON) because it now requires a student
// ID card photo upload alongside the regular fields.
router.post("/register", upload.single("studentIdPhoto"), async (req, res) => {
  try {
    const { name, email, password, phone, department, faculty, matricNumber } = req.body;
    if (!name || !email || !password || !matricNumber) {
      return res.status(400).json({ error: "name, email, password and matric number are required" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "A photo of your student ID card is required" });
    }
    if (!MATRIC_NUMBER_PATTERN.test(matricNumber.trim())) {
      return res.status(400).json({ error: "Matric number should look like AK20/ENG/MEC/001" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    const existingMatric = await prisma.user.findUnique({ where: { matricNumber: matricNumber.trim() } });
    if (existingMatric) {
      return res.status(409).json({ error: "This matric number is already registered to another account" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        department,
        faculty,
        matricNumber: matricNumber.trim(),
        studentIdPhotoUrl: `/uploads/${req.file.filename}`,
        passwordHash,
        // Format-valid + unique matric number, plus an ID card photo, still
        // isn't proof of real enrollment — it's a much stronger starting
        // point than a bare text field, but an admin should actually look
        // at the photo before clicking "Verify" in the Admin dashboard.
        verificationStatus: "PENDING",
      },
    });
    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user, getBadges(user, 0)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = signToken(user);
    const unresolvedDisputes = await prisma.dispute.count({ where: { sellerId: user.id, status: "OPEN" } });
    res.json({ token, user: publicUser(user, getBadges(user, unresolvedDisputes)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: "User not found" });
  const unresolvedDisputes = await prisma.dispute.count({ where: { sellerId: user.id, status: "OPEN" } });
  res.json({ user: publicUser(user, getBadges(user, unresolvedDisputes)) });
});

// POST /api/auth/forgot-password
// NOTE: no email provider is wired up yet. In development the reset link is
// returned directly in the response and logged to the console so you can
// test the flow end to end. Before going live, send it via an email service
// (Resend, SendGrid, Postmark, etc.) instead of returning it to the client.
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    // Always respond the same way whether or not the user exists, to avoid
    // leaking which emails are registered.
    if (!user) {
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 1000 * 60 * 30); // 30 min
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpires },
    });
    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;
    console.log(`[DEV] Password reset link for ${email}: ${resetLink}`);
    res.json({
      message: "If that email exists, a reset link has been sent.",
      devResetLink: process.env.NODE_ENV === "production" ? undefined : resetLink,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not process request" });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "token and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    const user = await prisma.user.findFirst({ where: { resetToken: token } });
    if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      return res.status(400).json({ error: "Reset link is invalid or has expired" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpires: null },
    });
    res.json({ message: "Password updated. You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not reset password" });
  }
});

module.exports = router;
