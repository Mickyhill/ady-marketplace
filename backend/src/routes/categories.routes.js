const express = require("express");
const prisma = require("../prismaClient");

const router = express.Router();

// GET /api/categories
router.get("/", async (req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  res.json({ categories });
});

module.exports = router;
