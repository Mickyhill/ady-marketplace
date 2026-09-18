const PAYSTACK_BASE_URL = "https://api.paystack.co";

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error("PAYSTACK_SECRET_KEY is not set. Sign up at paystack.com and add your test secret key to backend/.env before using payment routes.");
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
  const body = { email, amount: amountKobo, reference, callback_url: callbackUrl };
  if (subaccountCode) {
    body.subaccount = subaccountCode;
    if (platformFeeKobo != null) {
      body.transaction_charge = platformFeeKobo;
      body.bearer = "subaccount";
    }
  }
  return paystackRequest("/transaction/initialize", { method: "POST", body: JSON.stringify(body) });
}

async function verifyTransaction(reference) {
  return paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`, { method: "GET" });
}

async function initiateTransfer({ amountKobo, recipientCode, reason, reference }) {
  return paystackRequest("/transfer", {
    method: "POST",
    body: JSON.stringify({ source: "balance", amount: amountKobo, recipient: recipientCode, reason, reference }),
  });
}

async function createTransferRecipient({ name, accountNumber, bankCode }) {
  return paystackRequest("/transferrecipient", {
    method: "POST",
    body: JSON.stringify({ type: "nuban", name, account_number: accountNumber, bank_code: bankCode, currency: "NGN" }),
  });
}

async function refundTransaction(reference, amountKobo) {
  const body = { transaction: reference };
  if (amountKobo != null) body.amount = amountKobo;
  return paystackRequest("/refund", { method: "POST", body: JSON.stringify(body) });
}

function verifyWebhookSignature(rawBody, signatureHeader) {
  const crypto = require("crypto");
  const hash = crypto.createHmac("sha512", getSecretKey()).update(rawBody).digest("hex");
  return hash === signatureHeader;
}

// List Nigerian banks, for the "select your bank" dropdown on the seller payout form.
async function listBanks() {
  return paystackRequest("/bank?currency=NGN", { method: "GET" });
}

// Create a Paystack Subaccount for a seller — enables automatic payment splitting.
// percentageCharge is required at creation but never actually applies in practice,
// since every real transaction overrides it via transaction_charge + bearer at payment time.
async function createSubaccount({ businessName, bankCode, accountNumber, percentageCharge }) {
  return paystackRequest("/subaccount", {
    method: "POST",
    body: JSON.stringify({
      business_name: businessName,
      bank_code: bankCode,
      account_number: accountNumber,
      percentage_charge: percentageCharge,
    }),
  });
}

module.exports = {
  initializeTransaction,
  verifyTransaction,
  initiateTransfer,
  createTransferRecipient,
  refundTransaction,
  listBanks,
  createSubaccount,
  verifyWebhookSignature,
};