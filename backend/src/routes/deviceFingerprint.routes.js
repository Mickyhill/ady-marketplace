// Device fingerprint recording + same-device multi-account detection.
// PHASE1_ASSUMPTION: writes to a `RiskFlag` model when multiple accounts
// share a device. If Phase 1 already has its own risk-flag mechanism,
// swap the write in the "RISK FLAG HOOK" block below to use that instead.

const express = require("express");
const crypto = require("crypto");
const prisma = require("../prismaClient");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function hashValue(value) {
  // One-way hash — never store the raw fingerprint or IP (data minimization,
  // per the project's privacy note).
  return crypto.createHash("sha256").update(value).digest("hex");
}

// POST /api/device/register
// Called by the frontend after generating a device fingerprint (e.g. via
// FingerprintJS) on login/registration.
router.post("/register", requireAuth, async (req, res) => {
  try {
    const { fingerprint } = req.body;
    if (!fingerprint || typeof fingerprint !== "string") {
      return res.status(400).json({ error: "Device fingerprint is required" });
    }

    const hashedFingerprint = hashValue(fingerprint);
    const rawIp = req.ip || req.headers["x-forwarded-for"] || "";
    const hashedIp = rawIp ? hashValue(rawIp) : null;

    await prisma.deviceFingerprint.upsert({
      where: {
        fingerprint_userId: {
          fingerprint: hashedFingerprint,
          userId: req.user.id,
        },
      },
      update: { lastSeenAt: new Date(), ipHash: hashedIp },
      create: {
        fingerprint: hashedFingerprint,
        userId: req.user.id,
        ipHash: hashedIp,
      },
    });

    // Check how many DISTINCT users share this device fingerprint
    const sharedUsers = await prisma.deviceFingerprint.findMany({
      where: { fingerprint: hashedFingerprint },
      select: { userId: true },
      distinct: ["userId"],
    });

    if (sharedUsers.length > 1) {
      // RISK FLAG HOOK — swap this for Phase 1's risk system if it differs
      const severity = sharedUsers.length >= 3 ? "RED" : "YELLOW";
      await prisma.riskFlag.create({
        data: {
          userId: req.user.id,
          type: "MULTI_ACCOUNT_DEVICE",
          severity,
          details: `Device shared across ${sharedUsers.length} accounts`,
        },
      });
    }

    return res.json({ message: "Device recorded" });
  } catch (err) {
    console.error("device register error:", err);
    return res.status(500).json({ error: "Failed to record device" });
  }
});

module.exports = router;
