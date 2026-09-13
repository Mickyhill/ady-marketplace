import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Is ADY Marketplace free to use?",
    a: "Yes — browsing, listing, and messaging are free. A small platform fee applies only when you pay for an item through our secure payment option.",
  },
  {
    q: "Do all users need to be verified students?",
    a: "Yes — everyone registers with a matric number and a screenshot of their AKSU student portal dashboard. An admin reviews this before an account is fully AKSU Verified.",
  },
  {
    q: "How do payments work?",
    a: "When you buy through ADY Marketplace, your payment is held securely until you confirm you've received the item, then it's released to the seller. You can also arrange payment directly with a seller, but we can't help resolve a problem that happened entirely off-platform.",
  },
  {
    q: "How do I delete my account?",
    a: "Go to your Profile page and select \"Delete my account.\" This is permanent and removes your personal details from the platform.",
  },
  {
    q: "How quickly are reports reviewed?",
    a: "Admins aim to review reported listings within 24 hours.",
  },
  {
    q: "Is there a mobile app?",
    a: "Not yet — ADY Marketplace currently works as a website that works well on your phone's browser. Native apps are planned for the future.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-2">Frequently Asked Questions</h1>
      <p className="text-sm text-ink-500 mb-6">Everything you need to know about ADY Marketplace.</p>

      <div className="space-y-2">
        {FAQS.map((item, i) => (
          <div key={item.q} className="border border-ink-300/40 rounded-lg bg-white">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium"
            >
              {item.q}
              <ChevronDown size={16} className={`transition-transform ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && <p className="px-4 pb-3 text-sm text-ink-500">{item.a}</p>}
          </div>
        ))}
      </div>

      <div className="mt-8 text-center border-t border-ink-300/40 pt-6">
        <p className="text-sm text-ink-500 mb-2">Still have questions?</p>
        <a href="mailto:adymarketplace76@gmail.com" className="inline-block bg-brand-500 hover:bg-brand-600 text-white rounded-md px-4 py-2 text-sm font-medium">
          Contact Support
        </a>
      </div>
    </div>
  );
}
