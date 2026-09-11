// Called from the existing listings.routes.js create-listing flow, after
// ListingImage rows are created and files are saved to disk.
//
// PHASE1_ASSUMPTION: writes to `RiskFlag` — see note in
// deviceFingerprint.routes.js. Same hook, same caveat.
//
// INTEGRATION: in listings.routes.js, after saving each uploaded image and
// creating its ListingImage row, call:
//
//   const { checkAndRecordImage } = require("../services/duplicatePhotoCheck");
//   await checkAndRecordImage(listingImage.id, fullFilePathOnDisk);
//
// This is deliberately NOT run inside the same transaction as listing
// creation — hashing is slower than a DB write and shouldn't block the
// user's listing from going live. It runs right after, fire-and-forget-safe
// (errors are caught and logged, never thrown back to the request).

const prisma = require("../prismaClient");
const { hashImage, hammingDistance, DUPLICATE_THRESHOLD } = require("./imageHash");

async function checkAndRecordImage(listingImageId, filePath) {
  try {
    const hash = await hashImage(filePath);

    await prisma.listingImage.update({
      where: { id: listingImageId },
      data: { perceptualHash: hash },
    });

    // Compare against existing hashes. For a small-to-medium marketplace
    // this linear scan is fine; if the catalog grows large, this should
    // move to a proper nearest-neighbor index (e.g. a locality-sensitive
    // hash bucket) instead of comparing against every row.
    const existingImages = await prisma.listingImage.findMany({
      where: {
        perceptualHash: { not: null },
        id: { not: listingImageId },
      },
      select: { id: true, perceptualHash: true, listingId: true },
    });

    for (const existing of existingImages) {
      const distance = hammingDistance(hash, existing.perceptualHash);
      if (distance <= DUPLICATE_THRESHOLD) {
        await prisma.duplicateImageFlag.create({
          data: {
            originalImageId: existing.id,
            suspectImageId: listingImageId,
            hammingDistance: distance,
          },
        });

        // RISK FLAG HOOK — swap for Phase 1's risk system if it differs
        const currentImage = await prisma.listingImage.findUnique({
          where: { id: listingImageId },
          select: { listingId: true },
        });
        await prisma.riskFlag.create({
          data: {
            listingId: currentImage.listingId,
            type: "DUPLICATE_PHOTO",
            severity: distance <= 4 ? "RED" : "YELLOW",
            details: `Image closely matches an image on another listing (distance: ${distance})`,
          },
        });
      }
    }
  } catch (err) {
    // Never let a hashing failure break listing creation
    console.error("duplicate photo check failed:", err);
  }
}

module.exports = { checkAndRecordImage };
