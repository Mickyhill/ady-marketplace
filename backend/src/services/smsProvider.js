// SMS provider abstraction for OTP sending.
//
// PHASE1_ASSUMPTION: none — this is fully self-contained.
//
// The owner hasn't chosen a provider yet (Termii vs Africa's Talking).
// This file isolates that choice to ONE place. Once they sign up and hand
// over an API key, only this file needs a real implementation swapped in —
// nothing in otp.routes.js needs to change.
//
// Until SMS_PROVIDER_API_KEY is set in .env, this falls back to a DEV MODE
// that logs the OTP to the server console instead of sending a real SMS.
// This lets the whole OTP flow be built and tested end-to-end right now.

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
// Docs: https://developers.termii.com/messaging
async function sendViaTermii(phone, code) {
  const res = await fetch("https://api.ng.termii.com/api/sms/otp/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.SMS_PROVIDER_API_KEY,
      message_type: "NUMERIC",
      to: phone,
      from: process.env.SMS_SENDER_ID || "MyMarketPlace",
      channel: "generic",
      pin_attempts: 3,
      pin_time_to_live: 10, // minutes
      pin_length: 6,
      pin_placeholder: "< 1234 >",
      message_text: `Your MyMarketPlace verification code is < 1234 >. Valid for 10 minutes.`,
      pin_type: "NUMERIC",
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Termii send failed: ${data.message || res.statusText}`);
  }
  return { success: true, providerRef: data.pinId };
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
      message: `Your MyMarketPlace verification code is ${code}. Valid for 10 minutes.`,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Africa's Talking send failed: ${JSON.stringify(data)}`);
  }
  return { success: true, providerRef: data.SMSMessageData?.Recipients?.[0]?.messageId };
}

module.exports = { sendOtp, DEV_MODE };
