// Payment provider webhooks. Paystack calls this route to confirm payment
// events server-to-server — this is the source of truth for "did the
// payment actually succeed", NOT the frontend redirect after checkout
// (that can be spoofed or interrupted).
//
// CRITICAL: this route needs the RAW request body to verify the webhook
// signature (Paystack signs the exact raw bytes sent). If express.json()
// has already parsed the body by the time this route runs, signature
// verification will fail. See INDEX-JS-ADDITIONS.md for the mounting
// order this requires.

const express = require("express");
const prisma = require("../prismaClient");
const paystack = require("../services/paystack");

const router = express.Router();

router.post(
  "/paystack",
  express.raw({ type: "application/json" }), // raw body, NOT express.json()
  async (req, res) => {
    const signature = req.headers["x-paystack-signature"];
    const rawBody = req.body; // Buffer, thanks to express.raw()

    const signatureValid = signature && paystack.verifyWebhookSignature(rawBody, signature);

    // Log every webhook attempt for audit purposes, valid or not
    let event;
    try {
      event = JSON.parse(rawBody.toString("utf8"));
    } catch {
      event = null;
    }

    await prisma.paymentWebhookEvent.create({
      data: {
        provider: "PAYSTACK",
        eventType: event?.event || "unknown",
        rawPayload: rawBody.toString("utf8"),
        signatureOk: !!signatureValid,
      },
    });

    if (!signatureValid) {
      // Do not process — but still return 200 so Paystack doesn't retry
      // forever on what might just be a misconfigured signature. Log
      // loudly instead so it gets noticed.
      console.error("Paystack webhook: INVALID SIGNATURE — event ignored");
      return res.sendStatus(200);
    }

    if (!event) {
      return res.sendStatus(400);
    }

    try {
      if (event.event === "charge.success") {
        await handleChargeSuccess(event.data);
      }
      // Other event types (transfer.success, transfer.failed, etc.) can be
      // added here as the payout path is built out.
    } catch (err) {
      console.error("Error processing Paystack webhook:", err);
      // Still 200 — Paystack will retry on non-2xx, which could cause
      // duplicate processing. Log and handle failures out-of-band instead.
    }

    return res.sendStatus(200);
  }
);

async function handleChargeSuccess(data) {
  const reference = data.reference;

  const transaction = await prisma.transaction.findUnique({
    where: { id: reference },
  });

  if (!transaction) {
    console.error(`Webhook: no transaction found for reference ${reference}`);
    return;
  }

  if (transaction.status !== "PENDING") {
    // Already processed (webhook can fire more than once) — no-op
    return;
  }

  // Always re-verify with Paystack directly rather than trusting the
  // webhook payload's amount/status alone
  const verified = await paystack.verifyTransaction(reference);
  if (verified.data.status !== "success") {
    console.error(`Webhook claimed success but verify failed for ${reference}`);
    return;
  }
  if (verified.data.amount !== transaction.totalAmount) {
    console.error(`Amount mismatch for ${reference}: expected ${transaction.totalAmount}, got ${verified.data.amount}`);
    return;
  }

  await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      status: "HELD",
      providerSubaccount: verified.data.subaccount?.subaccount_code || null,
    },
  });

  // Take the listing off the market now that it's paid for — also lines up
  // with Phase 1's review flow, which only allows reviewing SOLD listings.
  await prisma.listing.update({
    where: { id: transaction.listingId },
    data: { status: "SOLD" },
  });

  await prisma.paymentWebhookEvent.updateMany({
    where: { rawPayload: { contains: reference } },
    data: { processedAt: new Date() },
  });
}

module.exports = router;
