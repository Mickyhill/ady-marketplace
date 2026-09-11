// Computes a user's trust badges and admin-only risk level from data
// already on the User record (plus counts passed in where needed).
// Centralized here so every route that shows badges/risk agrees with
// each other instead of drifting apart over time.

// "Trusted Seller" is intentionally NOT a stored field — it's recomputed
// live from current stats every time, so it can never go stale (e.g. if a
// dispute happens after the badge was granted, it disappears automatically
// instead of requiring someone to remember to revoke it).
function computeTrustedSeller(user, unresolvedDisputeCount = 0) {
  return (
    user.ratingCount >= 20 &&
    user.rating >= 4.5 &&
    unresolvedDisputeCount === 0
  );
}

// Returns the badge set for a user, safe to expose publicly (no numeric
// scores, no raw counts that could be reverse-engineered into a score).
function getBadges(user, unresolvedDisputeCount = 0) {
  return {
    phoneVerified: !!user.phoneVerified,
    aksuVerified: user.verificationStatus === "VERIFIED",
    identityVerified: !!user.identityVerified,
    trustedSeller: computeTrustedSeller(user, unresolvedDisputeCount),
  };
}

// Simple, explainable rule-based risk score — ADMIN-ONLY, never exposed to
// regular users or in any public API response. Deliberately not AI/ML:
// transparent, auditable rules an admin can understand and adjust.
function computeRiskLevel({ user, unresolvedReportsAgainst = 0, unresolvedDisputesAgainst = 0, accountAgeDays = 0 }) {
  let score = 50; // start at "Normal"

  if (user.verificationStatus === "VERIFIED") score += 20;
  if (user.phoneVerified) score += 10;
  if (user.identityVerified) score += 20;
  if (user.ratingCount >= 5 && user.rating >= 4) score += 10;

  if (unresolvedReportsAgainst > 0) score -= 20 * unresolvedReportsAgainst;
  if (unresolvedDisputesAgainst > 0) score -= 30 * unresolvedDisputesAgainst;
  if (accountAgeDays < 7) score -= 10;

  score = Math.max(0, Math.min(100, score));

  let level;
  if (score >= 80) level = "LOW";
  else if (score >= 60) level = "NORMAL";
  else if (score >= 40) level = "REVIEW";
  else level = "HIGH";

  return { score, level }; // score itself stays admin-only too — UI shows only the level
}

module.exports = { computeTrustedSeller, getBadges, computeRiskLevel };
