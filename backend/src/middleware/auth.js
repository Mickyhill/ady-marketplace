const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient");

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Attaches req.user if a valid token is present, but doesn't reject if absent.
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    const token = header.split(" ")[1];
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // ignore invalid token, treat as anonymous
    }
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// Blocks listing, buying, and messaging until an admin has verified the
// account. Must be used AFTER requireAuth. Does a fresh DB lookup rather
// than trusting anything on the JWT — req.user only carries { id, email,
// role } from token issue time, so a user verified by an admin *after*
// logging in would otherwise stay blocked until their token happened to
// refresh, which is confusing and avoidable.
async function requireVerified(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { verificationStatus: true },
    });
    if (!user || user.verificationStatus !== "VERIFIED") {
      return res.status(403).json({
        error: "Your account needs to be verified by an admin before you can do this. Make sure you've submitted your student portal screenshot — check back soon, or contact support if it's been a while.",
      });
    }
    next();
  } catch (err) {
    console.error("requireVerified error:", err);
    res.status(500).json({ error: "Could not check verification status" });
  }
}

module.exports = { requireAuth, optionalAuth, requireAdmin, requireVerified };