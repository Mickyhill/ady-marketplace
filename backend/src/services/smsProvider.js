// SMS provider abstraction for OTP sending.
//
// PHASE1_ASSUMPTION: none — this is fully self-contained.
//
// This file isolates the provider choice to ONE place. Once a real
// SMS_PROVIDER_API_KEY is set, only this file needs touching — nothing in
// otp.routes.js needs to change.
//
// Until SMS_PROVIDER_API_KEY is set in .env, this falls back to a DEV MODE
// that logs the OTP to the server console instead of sending a real SMS.

const DEV_MODE = !process.env.SMS_PROVIDER_API_KEY;

/**
 * Send an OTP code to a phone number.
 * @param {string} phone - E.164 or local Nigerian format, e.g. "08012345678"
 * @param {string} code - the plaintext OTP to send
 * @returns {Promise<{ success: boolean, providerRef?: string }>}
 */
async function sendOtp(phone, code) {
  if (DEV_MODE) {
    // eslint-disable-next-line no-console
    console.log(`[DEV MODE — no SMS_PROVIDER_API_KEY set] OTP for ${phone}: ${code}`);
    return { success: true, providerRef: "dev-mode-no-provider" };
  }

  const provider = process.env.SMS_PROVIDER; // "termii" | "africastalking"

  if (provider === "termii") {
    return sendViaTermii(phone, code);
  }
  if (provider === "africastalking") {
    return sendViaAfricasTalking(phone, code);
  }

  throw new Error(
    `SMS_PROVIDER_API_KEY is set but SMS_PROVIDER env var is missing or unrecognized. ` +
    `Set SMS_PROVIDER to "termii" or "africastalking" in backend/.env.`
  );
}

// --- Termii implementation ---
// Uses Termii's plain Messaging API (POST /api/sms/send) with OUR OWN
// already-generated `code` embedded in the message text — NOT Termii's
// separate "Send Token" product (/api/sms/otp/send), which generates and
// manages its own OTP internally and would never match whatever code our
// own otp.routes.js generated, hashed, and stored for verification.
// Docs: https://developers.termii.com/messaging-api
async function sendViaTermii(phone, code) {
  const res = await fetch("https://v4.api.termii.com/api/sms/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.SMS_PROVIDER_API_KEY,
      to: phone,
      // Nigerian alphanumeric SMS sender IDs are capped at 11 characters —
      // "ADY Marketplace" (15 chars) would be rejected or truncated by most
      // gateways, so the fallback here is a shortened version. Set
      // SMS_SENDER_ID in .env to whatever short ID you register with Termii.
      from: process.env.SMS_SENDER_ID || "ADYMarket",
      sms: `Your ADY Marketplace verification code is ${code}. Valid for 10 minutes.`,
      type: "plain",
      // "dnd" = the transactional route. Termii's own docs specifically
      // warn against using the "generic" (promotional) route for OTPs —
      // it risks delivery failures or the sender ID getting blocked.
      channel: "dnd",
    }),
  });
  const data = await res.json();
  if (!res.ok || data.code !== "ok") {
    throw new Error(`Termii send failed: ${data.message || res.statusText}`);
  }
  return { success: true, providerRef: data.message_id };
}

// --- Africa's Talking implementation ---
// Docs: https://developers.africastalking.com/docs/sms/overview
async function sendViaAfricasTalking(phone, code) {
  const res = await fetch("https://api.africastalking.com/version1/messaging", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      apiKey: process.env.SMS_PROVIDER_API_KEY,
    },
    body: new URLSearchParams({
      username: process.env.SMS_PROVIDER_USERNAME || "",
      to: phone,
      message: `Your ADY Marketplace verification code is ${code}. Valid for 10 minutes.`,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Africa's Talking send failed: ${JSON.stringify(data)}`);
  }
  return { success: true, providerRef: data.SMSMessageData?.Recipients?.[0]?.messageId };
}

module.exports = { sendOtp, DEV_MODE };