const express = require("express");
const prisma = require("../prismaClient");

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/newsletter/subscribe — public, no auth required. Just captures
// an email for now; actually sending newsletters is a separate step once
// an email service is wired up.
router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) {
      return res.json({ message: "You're already subscribed." });
    }

    await prisma.newsletterSubscriber.create({ data: { email } });
    res.status(201).json({ message: "Subscribed! We'll keep you posted." });
  } catch (err) {
    console.error("newsletter subscribe error:", err);
    res.status(500).json({ error: "Could not subscribe right now. Please try again." });
  }
});

module.exports = router;
