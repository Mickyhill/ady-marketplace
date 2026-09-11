// Paystack integration for escrow-style payments.
//
// WHY PAYSTACK: the handoff doc listed Paystack and Flutterwave as the two
// options. Paystack is used here because its "Subaccounts" split-payment
// feature is well documented and its test/sandbox mode requires only a
// free signup (no business KYC) to get started. This is a DEFAULT CHOICE,
// not a locked-in one — if the owner later prefers Flutterwave, only this
// file and webhooks.routes.js need rewriting; nothing else in the app
// depends on which provider is used.
//
// The owner needs to, before this can charge real money:
//   1. Sign up at https://paystack.com (free)
//   2. Get PAYSTACK_SECRET_KEY / PAYSTACK_PUBLIC_KEY from the test
//      dashboard (works immediately, no business verification needed
//      for test mode)
//   3. Later, for real payouts: complete Paystack's business verification
//      and create a Subaccount per seller (or a single platform account,
//      depending on the payout model chosen — see note in
//      createSubaccountForSeller below)
//
// Docs: https://paystack.com/docs/payments/split-payments/

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not set. Sign up at paystack.com and add your " +
      "test secret key to backend/.env before using payment routes."
    );
  }
  return key;
}

async function paystackRequest(path, options = {}) {
  const res = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok || data.status === false) {
    throw new Error(`Paystack error: ${data.message || res.statusText}`);
  }
  return data;
}

/**
 * Initialize a payment for a transaction. Buyer is redirected to
 * data.data.authorization_url to complete payment.
 * @param {object} params
 * @param {string} params.email - buyer's email
 * @param {number} params.amountKobo - total amount in kobo (NGN * 100)
 * @param {string} params.reference - unique reference, should match our Transaction.id
 * @param {string} [params.subaccountCode] - seller's Paystack subaccount, for auto-split
 * @param {number} [params.platformFeeKobo] - platform's cut, in kobo, when using a subaccount split
 */
async function initializeTransaction({ email, amountKobo, reference, subaccountCode, platformFeeKobo, callbackUrl }) {
  const body = {
    email,
    amount: amountKobo,
    reference,
    callback_url: callbackUrl,
  };

  // If the seller has a subaccount set up, Paystack auto-splits the payment
  // at settlement time — this is what gives us "escrow-ish" behavior without
  // us ever directly holding customer funds. If no subaccount exists yet
  // (seller hasn't onboarded), fall back to holding the full amount in the
  // platform account and doing a manual transfer later via releaseFunds().
  if (subaccountCode) {
    body.subaccount = subaccountCode;
    if (platformFeeKobo != null) {
      body.transaction_charge = platformFeeKobo;
      body.bearer = "subaccount"; // seller's subaccount bears Paystack's own processing fee
    }
  }

  return paystackRequest("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Verify a transaction's status directly with Paystack (don't trust
 * client-side redirect state alone — always re-verify server-side).
 */
async function verifyTransaction(reference) {
  return paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`, {
    method: "GET",
  });
}

/**
 * For the manual-transfer fallback path (seller has no subaccount yet):
 * initiate a payout from the platform's Paystack balance to the seller's
 * bank account. Requires the seller to have provided bank details, and
 * requires the PLATFORM's Paystack account to have transfers enabled
 * (this typically DOES require completed business KYC — test mode transfer
 * simulation is available but real payouts need it).
 */
async function initiateTransfer({ amountKobo, recipientCode, reason, reference }) {
  return paystackRequest("/transfer", {
    method: "POST",
    body: JSON.stringify({
      source: "balance",
      amount: amountKobo,
      recipient: recipientCode,
      reason,
      reference,
    }),
  });
}

/**
 * Create a transfer recipient (seller's bank account) — needed before
 * initiateTransfer can pay them out, if not using the subaccount-split path.
 */
async function createTransferRecipient({ name, accountNumber, bankCode }) {
  return paystackRequest("/transferrecipient", {
    method: "POST",
    body: JSON.stringify({
      type: "nuban",
      name,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: "NGN",
    }),
  });
}

/**
 * Verify a webhook's signature. Paystack signs webhook payloads with
 * HMAC-SHA512 using the secret key. NEVER process a webhook without this
 * check — the handoff doc explicitly calls this out as a common gap.
 */
function verifyWebhookSignature(rawBody, signatureHeader) {
  const crypto = require("crypto");
  const hash = crypto
    .createHmac("sha512", getSecretKey())
    .update(rawBody)
    .digest("hex");
  return hash === signatureHeader;
}

module.exports = {
  initializeTransaction,
  verifyTransaction,
  initiateTransfer,
  createTransferRecipient,
  verifyWebhookSignature,
};
