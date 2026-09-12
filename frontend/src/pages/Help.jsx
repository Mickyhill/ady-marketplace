import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MessageCircle } from "lucide-react";

export default function Help() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-sm">
      <h1 className="text-2xl font-semibold mb-2">Help & Support</h1>
      <p className="text-ink-500 mb-6">Need a hand with something? Here's how to reach us, or find a quick answer yourself.</p>

      <div className="grid gap-3 mb-8">
        <a href="mailto:adymarketplace76@gmail.com" className="flex items-center gap-3 border border-ink-300/40 rounded-lg p-4 bg-white hover:bg-ink-100">
          <Mail size={18} className="text-brand-600" />
          <div>
            <p className="font-medium">Email us</p>
            <p className="text-ink-500 text-xs">adymarketplace76@gmail.com</p>
          </div>
        </a>
        <a href="tel:+2348071569877" className="flex items-center gap-3 border border-ink-300/40 rounded-lg p-4 bg-white hover:bg-ink-100">
          <Phone size={18} className="text-brand-600" />
          <div>
            <p className="font-medium">Call or WhatsApp</p>
            <p className="text-ink-500 text-xs">+234 807 156 9877 · +234 802 511 9599</p>
          </div>
        </a>
      </div>

      <div className="flex items-center gap-2 text-ink-500">
        <MessageCircle size={16} />
        <p>Reporting a specific listing or user? Use the "Report" button on that listing instead — it reaches admins directly with the right context.</p>
      </div>

      <Link to="/faq" className="inline-block mt-6 text-brand-600 underline">See Frequently Asked Questions</Link>
    </div>
  );
}