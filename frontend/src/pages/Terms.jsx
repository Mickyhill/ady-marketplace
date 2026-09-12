import React from "react";

export default function Terms() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-sm space-y-4">
      <h1 className="text-2xl font-semibold mb-2">Terms of Service</h1>
      <p className="text-ink-500 text-xs italic">
        Starting-point terms, not legal advice — have a lawyer review these before a real launch,
        especially the payment and liability sections.
      </p>

      <section>
        <h2 className="font-semibold mt-4 mb-1">Who can use ADY Marketplace</h2>
        <p>You must be a genuine AKSU student (or otherwise approved by an admin) to register. Providing a
        false matric number, a fake student ID photo, or impersonating another student is grounds for
        immediate account removal.</p>
      </section>

      <section>
        <h2 className="font-semibold mt-4 mb-1">Listings</h2>
        <p>You're responsible for the accuracy of what you list — condition, photos, and description should
        genuinely reflect the item. Prohibited items include anything illegal, stolen, counterfeit, or
        unsafe.</p>
      </section>

      <section>
        <h2 className="font-semibold mt-4 mb-1">Payments</h2>
        <p>When you pay through ADY Marketplace, your funds are held until you confirm you've received the
        item, then released to the seller. ADY Marketplace takes a platform fee on completed transactions. We
        are not a bank — held funds sit with our payment provider, not with us directly.</p>
      </section>

      <section>
        <h2 className="font-semibold mt-4 mb-1">Disputes</h2>
        <p>If something goes wrong with a paid transaction, either party can open a dispute. An admin reviews
        the listing, messages, and payment record before deciding an outcome. ADY Marketplace's decision on a
        dispute is final within the platform, though this doesn't affect any other legal rights you may
        have.</p>
      </section>

      <section>
        <h2 className="font-semibold mt-4 mb-1">Account removal</h2>
        <p>We may suspend or remove accounts that violate these terms or our Community Guidelines, including
        for fraud, harassment, or repeated unresolved disputes.</p>
      </section>

      <section>
        <h2 className="font-semibold mt-4 mb-1">Limitation of liability</h2>
        <p>ADY Marketplace facilitates connections between buyers and sellers but is not a party to the actual
        sale of goods. We do our best to verify students and flag risk, but we can't guarantee every
        transaction will go smoothly.</p>
      </section>

      <p className="text-ink-500 text-xs mt-8">Last updated: this is placeholder content — update this date when you finalize reviewed terms.</p>
    </div>
  );
}
