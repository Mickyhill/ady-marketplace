// Client-side device fingerprint generation.
//
// Uses @fingerprintjs/fingerprintjs (the free open-source version, not the
// paid Pro API — no external account or API key needed for this).
//
// Called once after login/registration succeeds — see AuthContext.jsx.

import FingerprintJS from "@fingerprintjs/fingerprintjs";

let cachedFingerprint = null;

/**
 * Generate (or return cached) device fingerprint for this browser/device.
 * @returns {Promise<string>}
 */
export async function getDeviceFingerprint() {
  if (cachedFingerprint) return cachedFingerprint;

  const fp = await FingerprintJS.load();
  const result = await fp.get();
  cachedFingerprint = result.visitorId;
  return cachedFingerprint;
}