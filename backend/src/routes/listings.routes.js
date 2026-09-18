const express = require("express");
const prisma = require("../prismaClient");
const { requireAuth, requireVerified } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { checkAndRecordImage } = require("../services/duplicatePhotoCheck");
const { getBadges } = require("../utils/trust");

const router = express.Router();

// GET /api/listings — public browse, with filters
router.get("/", async (req, res) => {
  try {
    const {
      q, category, minPrice, maxPrice, condition, location,
      sort = "newest", featured, page = "1", pageSize = "20",
    } = req.query;

    const where = { status: "ACTIVE" };
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
      ];
    }
    if (category) where.categoryId = category;
    if (condition) where.condition = condition;
    if (location) where.location = { contains: location };
    if (featured === "true") {
      where.AND = (where.AND || []).concat([{ OR: [{ featured: true }, { boostedUntil: { gt: new Date() } }] }]);
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const orderBy =
      sort === "price_asc" ? { price: "asc" } :
      sort === "price_desc" ? { price: "desc" } :
      { createdAt: "desc" };

    const take = Math.min(parseInt(pageSize, 10) || 20, 50);
    const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where, orderBy, take, skip,
        include: { images: true, category: true },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({ listings, total });
  } catch (err) {
    console.error("get listings error:", err);
    res.status(500).json({ error: "Could not load listings" });
  }
});

// GET /api/listings/mine/all — the logged-in user's own listings, any status
router.get("/mine/all", requireAuth, async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { sellerId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: { images: true, category: true },
    });
    res.json({ listings });
  } catch (err) {
    console.error("get my listings error:", err);
    res.status(500).json({ error: "Could not load your listings" });
  }
});

// GET /api/listings/:id — single listing detail
router.get("/:id", async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: {
        images: true,
        category: true,
        seller: {
          select: {
            id: true, name: true, avatarUrl: true, bio: true,
            department: true, faculty: true, rating: true, ratingCount: true,
            createdAt: true, verificationStatus: true, phoneVerified: true,
            identityVerified: true,
          },
        },
      },
    });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const unresolvedDisputes = await prisma.dispute.count({
      where: { sellerId: listing.seller.id, status: "OPEN" },
    });
    listing.seller.badges = getBadges(listing.seller, unresolvedDisputes);

    // Fire-and-forget view count bump — never blocks or fails the response
    prisma.listing.update({
      where: { id: listing.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});

    res.json({ listing });
  } catch (err) {
    console.error("get listing error:", err);
    res.status(500).json({ error: "Could not load this listing" });
  }
});

// POST /api/listings — create a new listing (with photo uploads)
router.post("/", requireAuth, requireVerified, upload.array("images", 6), async (req, res) => {
  try {
    const { title, description, price, categoryId, condition, location } = req.body;
    if (!title || !price || !categoryId || !condition || !location) {
      return res.status(400).json({ error: "Please fill in all required fields" });
    }

    const listing = await prisma.listing.create({
      data: {
        title, description, price: parseFloat(price), categoryId, condition, location,
        sellerId: req.user.id,
      },
    });

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await prisma.listingImage.create({
          data: { url: file.path, listingId: listing.id },
        });
        // Fire-and-forget duplicate/stolen-photo check — never blocks listing creation
        checkAndRecordImage(file.path, listing.id, req.user.id).catch((err) =>
          console.error("duplicate photo check failed:", err)
        );
      }
    }

    const full = await prisma.listing.findUnique({
      where: { id: listing.id },
      include: { images: true, category: true },
    });
    res.status(201).json({ listing: full });
  } catch (err) {
    console.error("create listing error:", err);
    res.status(500).json({ error: "Could not create listing" });
  }
});

// PATCH /api/listings/:id — update a listing's own fields
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.sellerId !== req.user.id) {
      return res.status(403).json({ error: "You can only edit your own listings" });
    }

    const { title, description, price, condition, location } = req.body;
    const data = { title, description, condition, location };
    if (price !== undefined) data.price = parseFloat(price);
    Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);

    const updated = await prisma.listing.update({ where: { id: req.params.id }, data });
    res.json({ listing: updated });
  } catch (err) {
    console.error("update listing error:", err);
    res.status(500).json({ error: "Could not update this listing" });
  }
});

// PATCH /api/listings/:id/sold — mark a listing as sold
router.patch("/:id/sold", requireAuth, async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.sellerId !== req.user.id) {
      return res.status(403).json({ error: "You can only update your own listings" });
    }
    const updated = await prisma.listing.update({ where: { id: req.params.id }, data: { status: "SOLD" } });
    res.json({ listing: updated });
  } catch (err) {
    console.error("mark sold error:", err);
    res.status(500).json({ error: "Could not update this listing" });
  }
});

// DELETE /api/listings/:id — soft-delete (mark REMOVED)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.sellerId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "You can only delete your own listings" });
    }
    // Soft-delete rather than a real database delete. A listing with any
    // message, review, transaction, or dispute history can't be hard-deleted
    // anyway — Postgres correctly refuses it to protect that history — and
    // without a try/catch, that refusal used to crash the entire server
    // process rather than just failing this one request. Marking it REMOVED
    // instead sidesteps that permanently, and matches how the rest of the
    // app already treats removed listings (see the REMOVED status badge in
    // MyListings.jsx, and how self-deleted accounts remove their listings).
    await prisma.listing.update({ where: { id: req.params.id }, data: { status: "REMOVED" } });
    res.json({ message: "Listing removed" });
  } catch (err) {
    console.error("delete listing error:", err);
    res.status(500).json({ error: "Could not delete this listing. Please try again." });
  }
});

module.exports = router;