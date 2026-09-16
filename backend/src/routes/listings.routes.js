router.delete("/:id", requireAuth, async (req, res) => {
  const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  if (listing.sellerId !== req.user.id && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "You can only delete your own listings" });
  }
  await prisma.listing.delete({ where: { id: req.params.id } });
  res.json({ message: "Listing deleted" });
});