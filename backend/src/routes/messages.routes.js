const express = require("express");
const prisma = require("../prismaClient");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/messages/conversations — list of conversations the user is part of
// A "conversation" = a unique (listing, other participant) pair.
router.get("/conversations", requireAuth, async (req, res) => {
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: req.user.id }, { receiverId: req.user.id }] },
    orderBy: { createdAt: "desc" },
    include: {
      listing: { select: { id: true, title: true, price: true, images: true } },
      sender: { select: { id: true, name: true, avatarUrl: true } },
      receiver: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  const conversations = new Map();
  for (const m of messages) {
    const otherUser = m.senderId === req.user.id ? m.receiver : m.sender;
    const key = `${m.listingId}:${otherUser.id}`;
    if (!conversations.has(key)) {
      conversations.set(key, {
        listing: m.listing,
        otherUser,
        lastMessage: m.content,
        lastMessageAt: m.createdAt,
        unread: m.receiverId === req.user.id && !m.readAt,
      });
    }
  }
  res.json({ conversations: Array.from(conversations.values()) });
});

// GET /api/messages/thread/:listingId/:otherUserId — full thread with one user about one listing
router.get("/thread/:listingId/:otherUserId", requireAuth, async (req, res) => {
  const { listingId, otherUserId } = req.params;
  const messages = await prisma.message.findMany({
    where: {
      listingId,
      OR: [
        { senderId: req.user.id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: req.user.id },
      ],
    },
    orderBy: { createdAt: "asc" },
  });
  // mark incoming messages as read
  await prisma.message.updateMany({
    where: { listingId, senderId: otherUserId, receiverId: req.user.id, readAt: null },
    data: { readAt: new Date() },
  });
  res.json({ messages });
});

// POST /api/messages — send a message about a listing
router.post("/", requireAuth, async (req, res) => {
  try {
    const { listingId, content } = req.body;
    if (!listingId || !content || !content.trim()) {
      return res.status(400).json({ error: "listingId and content are required" });
    }
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    // The receiver is the seller, unless the sender IS the seller — in which
    // case this endpoint isn't the right one (sellers reply within a thread
    // using the buyer's id as receiverId, passed explicitly).
    const receiverId = req.body.receiverId || listing.sellerId;
    if (receiverId === req.user.id) {
      return res.status(400).json({ error: "You cannot message yourself about your own listing" });
    }

    const message = await prisma.message.create({
      data: { listingId, content: content.trim(), senderId: req.user.id, receiverId },
    });
    res.status(201).json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not send message" });
  }
});

module.exports = router;
