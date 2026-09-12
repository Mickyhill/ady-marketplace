import React from "react";
import { Link } from "react-router-dom";

const TIPS = [
  { title: "Use real photos", body: "Take clear photos in good light, from multiple angles. Listings with real photos sell faster and get fewer disputes." },
  { title: "Be honest about condition", body: "Mention scratches, missing parts, or wear upfront. It builds trust and avoids a dispute later." },
  { title: "Price it fairly", body: "Check what similar items are listed for before setting your price." },
  { title: "Respond quickly", body: "Buyers move on fast — replying within a few hours makes a real difference." },
  { title: "Get verified", body: "AKSU Verified, Phone Verified, and Identity Verified badges all make buyers more comfortable paying you." },
  { title: "Use secure payment", body: "Accepting payment through ADY Marketplace protects you too — funds are confirmed before you ship or hand anything over." },
];

export default function SellerGuide() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-2">Seller Guide</h1>
      <p className="text-sm text-ink-500 mb-6">A few things that help your listings sell faster and safer.</p>

      <div className="space-y-3">
        {TIPS.map((tip) => (
          <div key={tip.title} className="border border-ink-300/40 rounded-lg p-4 bg-white">
            <p className="font-medium text-sm mb-1">{tip.title}</p>
            <p className="text-sm text-ink-500">{tip.body}</p>
          </div>
        ))}
      </div>

      <Link to="/sell" className="inline-block mt-6 bg-brand-500 hover:bg-brand-600 text-white rounded-md px-4 py-2 text-sm font-medium">
        List an item now
      </Link>
    </div>
  );
}