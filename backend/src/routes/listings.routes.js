const express = require("express");
const prisma = require("../prismaClient");
const { requireAuth, optionalAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { getBadges } = require("../utils/trust");

const router = express.Router();

// GET /api/listings — browse/search with filters
// query params: q, category, minPrice, maxPrice, condition, location, sort, featured, page, pageSize
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
    if (featured === "true") where.featured = true;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const orderBy =
      sort === "price_asc" ? { price: "asc" } :
      sort === "price_desc" ? { price: "desc" } :
      { createdAt: "desc" }; // "newest" default

    const take = Math.min(parseInt(pageSize, 10) || 20, 50);
    const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where, orderBy, take, skip,
        include: {
          images: true,
          category: true,
          seller: { select: { id: true, name: true, verificationStatus: true, rating: true, ratingCount: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({ listings, total, page: Number(page), pageSize: take });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch listings" });
  }
});

// GET /api/listings/:id
router.get("/:id", optionalAuth, async (req, res) => {
  const listing = await prisma.listing.findUnique({
    where: { id: req.params.id },
    include: {
      images: true,
      category: true,
      seller: {
        select: {
          id: true, name: true, verificationStatus: true, phoneVerified: true, identityVerified: true,
          rating: true, ratingCount: true, avatarUrl: true,
        },
      },
    },
  });
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  const unresolvedDisputes = await prisma.dispute.count({ where: { sellerId: listing.seller.id, status: "OPEN" } });
  listing.seller.badges = getBadges(listing.seller, unresolvedDisputes);
  // fire-and-forget view count bump
  prisma.listing.update({ where: { id: listing.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});
  res.json({ listing });
});

// POST /api/listings — create (seller must be logged in)
router.post("/", requireAuth, upload.array("images", 6), async (req, res) => {
  try {
    const { title, description, price, condition, location, categoryId } = req.body;
    if (!title || !description || !price || !categoryId || !location) {
      return res.status(400).json({ error: "title, description, price, categoryId and location are required" });
    }
    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        condition: condition || "GOOD",
        location,
        sellerId: req.user.id,
        categoryId,
        images: {
          create: (req.files || []).map((f) => ({ url: `/uploads/${f.filename}` })),
        },
      },
      include: { images: true, category: true },
    });
    res.status(201).json({ listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create listing" });
  }
});

// GET /api/listings/mine/all — the logged-in seller's own listings (any status)
router.get("/mine/all", requireAuth, async (req, res) => {
  const listings = await prisma.listing.findMany({
    where: { sellerId: req.user.id },
    orderBy: { createdAt: "desc" },
    include: { images: true, category: true },
  });
  res.json({ listings });
});

// PATCH /api/listings/:id — update own listing
router.patch("/:id", requireAuth, async (req, res) => {
  const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  if (listing.sellerId !== req.user.id && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "You can only edit your own listings" });
  }
  const { title, description, price, condition, location } = req.body;
  const data = { title, description, location, condition };
  if (price !== undefined) data.price = parseFloat(price);
  Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);
  const updated = await prisma.listing.update({ where: { id: req.params.id }, data });
  res.json({ listing: updated });
});

// PATCH /api/listings/:id/sold — mark as sold
router.patch("/:id/sold", requireAuth, async (req, res) => {
  const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  if (listing.sellerId !== req.user.id) {
    return res.status(403).json({ error: "You can only update your own listings" });
  }
  const updated = await prisma.listing.update({ where: { id: req.params.id }, data: { status: "SOLD" } });
  res.json({ listing: updated });
});

// DELETE /api/listings/:id
router.delete("/:id", requireAuth, async (req, res) => {
  const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  if (listing.sellerId !== req.user.id && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "You can only delete your own listings" });
  }
  await prisma.listing.delete({ where: { id: req.params.id } });
  res.json({ message: "Listing deleted" });
});

module.exports = router;
