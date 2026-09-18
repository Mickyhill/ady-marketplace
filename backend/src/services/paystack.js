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

async function initializeTransaction({ email, amountKobo, reference, subaccountCode, platformFeeKobo, callbackUrl }) {
  const body = {
    email,
    amount: amountKobo,
    reference,
    callback_url: callbackUrl,
  };

  if (subaccountCode) {
    body.subaccount = subaccountCode;
    if (platformFeeKobo != null) {
      body.transaction_charge = platformFeeKobo;
      body.bearer = "subaccount";
    }
  }

  return paystackRequest("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

async function verifyTransaction(reference) {
  return paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`, {
    method: "GET",
  });
}

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
 * Refund a transaction to the buyer — the counterpart to releasing funds to
 * the seller. Used when an admin rules a dispute in the BUYER's favor.
 * Paystack refunds the buyer's original payment method directly; no
 * transfer/recipient setup needed, unlike paying out a seller.
 * @param {string} reference - the original transaction's Paystack reference
 * @param {number} [amountKobo] - partial refund amount; omit for a full refund
 */
async function refundTransaction(reference, amountKobo) {
  const body = { transaction: reference };
  if (amountKobo != null) body.amount = amountKobo;
  return paystackRequest("/refund", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

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
  refundTransaction,
  verifyWebhookSignature,
};