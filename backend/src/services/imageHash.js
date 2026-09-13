// Perceptual hashing for detecting duplicated/stolen listing photos.
// PHASE1_ASSUMPTION: none — fully self-contained.
//
// Uses sharp (already a common Node image lib, fast, well-maintained) to
// downscale + grayscale the image, then computes a simple average-hash
// (aHash). aHash is less precise than pHash (DCT-based) but has zero extra
// dependencies beyond sharp and is fast enough for upload-time checks.
// If false positives become a problem in practice, swap in blockhash-core
// or a proper pHash library — the interface below (hashImage, compareHashes)
// stays the same either way.

const sharp = require("sharp");

const HASH_SIZE = 8; // 8x8 = 64-bit hash

/**
 * Compute a perceptual hash for an image file.
 * @param {string} filePath - local disk path, OR a remote URL (Cloudinary)
 * @returns {Promise<string>} - 64-character binary string hash
 */
async function hashImage(filePath) {
  // Cloudinary storage means uploaded files never touch local disk — their
  // "path" is actually a remote URL. sharp can't read a URL directly, so
  // fetch the bytes into a buffer first. Local paths (e.g. in tests) still
  // work unchanged, since sharp accepts a bare path too.
  let input = filePath;
  if (typeof filePath === "string" && filePath.startsWith("http")) {
    const res = await fetch(filePath);
    if (!res.ok) throw new Error(`Could not fetch image for hashing: ${res.status}`);
    input = Buffer.from(await res.arrayBuffer());
  }

  const { data } = await sharp(input)
    .resize(HASH_SIZE, HASH_SIZE, { fit: "fill" })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Array.from(data);
  const avg = pixels.reduce((sum, p) => sum + p, 0) / pixels.length;

  return pixels.map((p) => (p >= avg ? "1" : "0")).join("");
}

/**
 * Hamming distance between two hashes of equal length.
 * Lower = more similar. 0 = identical. Above ~10 (of 64 bits) is
 * generally considered a different image.
 */
function hammingDistance(hashA, hashB) {
  if (hashA.length !== hashB.length) {
    throw new Error("Hashes must be the same length to compare");
  }
  let distance = 0;
  for (let i = 0; i < hashA.length; i++) {
    if (hashA[i] !== hashB[i]) distance++;
  }
  return distance;
}

// Threshold below which two images are flagged as likely duplicates.
// 64-bit hash, so <=10 bits different (~85% similar) is a reasonable
// starting point — tune based on false-positive rate once in use.
const DUPLICATE_THRESHOLD = 10;

module.exports = { hashImage, hammingDistance, DUPLICATE_THRESHOLD };
