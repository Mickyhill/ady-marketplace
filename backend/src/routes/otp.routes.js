// Phone OTP verification routes. Writes User.phoneVerified = true on
// success — confirmed against Phase 1's actual schema (same field name).

const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../prismaClient");
const { requireAuth } = require("../middleware/auth");
const { sendOtp } = require("../services/smsProvider");

const router = express.Router();

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

// POST /api/auth/phone/send-otp
router.post("/send-otp", requireAuth, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || typeof phone !== "string") {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Cooldown check to prevent spamming the SMS provider (and costs)
    if (
      user.phoneOtpExpiresAt &&
      new Date(user.phoneOtpExpiresAt).getTime() - OTP_TTL_MINUTES * 60 * 1000 + RESEND_COOLDOWN_SECONDS * 1000 >
        Date.now()
    ) {
      return res.status(429).json({ error: "Please wait before requesting another code" });
    }

    const code = generateOtp();
    const hashedCode = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneOtpCode: hashedCode,
        phoneOtpExpiresAt: expiresAt,
        phoneOtpAttempts: 0,
        phone, // update phone number on file
      },
    });

    await sendOtp(phone, code);

    return res.json({ message: "Verification code sent" });
  } catch (err) {
    console.error("send-otp error:", err);
    return res.status(500).json({ error: "Failed to send verification code" });
  }
});

// POST /api/auth/phone/verify-otp
router.post("/verify-otp", requireAuth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Verification code is required" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !user.phoneOtpCode || !user.phoneOtpExpiresAt) {
      return res.status(400).json({ error: "No verification code was requested" });
    }

    if (new Date(user.phoneOtpExpiresAt) < new Date()) {
      return res.status(400).json({ error: "Verification code has expired" });
    }

    if (user.phoneOtpAttempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ error: "Too many attempts. Please request a new code" });
    }

    const isValid = await bcrypt.compare(code, user.phoneOtpCode);

    if (!isValid) {
      await prisma.user.update({
        where: { id: user.id },
        data: { phoneOtpAttempts: { increment: 1 } },
      });
      return res.status(400).json({ error: "Invalid verification code" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerified: true,
        phoneOtpCode: null,
        phoneOtpExpiresAt: null,
        phoneOtpAttempts: 0,
      },
    });

    return res.json({ message: "Phone number verified" });
  } catch (err) {
    console.error("verify-otp error:", err);
    return res.status(500).json({ error: "Failed to verify code" });
  }
});

module.exports = router;
