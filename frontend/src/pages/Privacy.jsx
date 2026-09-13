import React from "react";

export default function Privacy() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-sm space-y-4">
      <h1 className="text-2xl font-semibold mb-2">Privacy Policy</h1>
      <p className="text-ink-500 text-xs italic">
        This is a starting-point policy, not legal advice — have it reviewed by a lawyer familiar with
        Nigeria's Data Protection Act before relying on it for a real, public launch.
      </p>

      <section>
        <h2 className="font-semibold mt-4 mb-1">What we collect</h2>
        <p>To verify you're a real AKSU student and keep the marketplace safe, we collect: your name, email,
        phone number, department, faculty, matric number, and a screenshot of your AKSU student portal dashboard. When you list
        an item, we collect photos and a description. When you pay or get paid through the platform, our
        payment provider (Paystack) processes your card/bank details — we never see or store your full card
        number.</p>
      </section>

      <section>
        <h2 className="font-semibold mt-4 mb-1">What we don't show publicly</h2>
        <p>Your matric number and student ID photo are visible only to admins, used solely to verify your
        account. Your email and phone number are never shown on your public profile.</p>
      </section>

      <section>
        <h2 className="font-semibold mt-4 mb-1">Why we collect it</h2>
        <p>Verification data reduces fraud and impersonation. Transaction data (messages, payments, disputes)
        exists so we can resolve problems between buyers and sellers if something goes wrong.</p>
      </section>

      <section>
        <h2 className="font-semibold mt-4 mb-1">Your rights</h2>
        <p>You can request a copy of your data, correct inaccurate information, or delete your account at any
        time from your Profile page. Deleting your account removes your personal details; some transaction
        records may be retained in anonymized form where needed for dispute resolution or legal
        recordkeeping. For any data request or question, email
        <a href="mailto:adymarketplace76@gmail.com" className="text-brand-600 underline"> adymarketplace76@gmail.com</a>.</p>
      </section>

      <section>
        <h2 className="font-semibold mt-4 mb-1">Who we share data with</h2>
        <p>Paystack (payment processing), and our SMS provider (phone verification, if enabled). We don't sell
        your data to advertisers or third parties.</p>
      </section>

      <p className="text-ink-500 text-xs mt-8">Last updated: this is placeholder content — update this date when you finalize a reviewed policy.</p>
    </div>
  );
}
