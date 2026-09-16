import React from "react";
import { ShieldAlert, Ban, Lock, Eye, Flag, MessageSquareWarning, ShieldCheck } from "lucide-react";

const TIPS = [
  { icon: Ban, text: "ADY Marketplace will never ask you to pay into a personal staff account." },
  { icon: Lock, text: "Never share your OTP, password, or login details with anyone." },
  { icon: Eye, text: "For expensive items, inspect the item in person before making payment." },
  { icon: Flag, text: "See something suspicious? Report it to us immediately." },
  { icon: MessageSquareWarning, text: "Keep your conversations on ADY Marketplace. Avoid moving deals to WhatsApp or other platforms." },
  { icon: ShieldCheck, text: "Pay and chat through ADY Marketplace. Deals made outside the platform are not covered by our protection or support." },
];

export default function SafetyTips({ className = "" }) {
  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-xl p-5 ${className}`}>
      <p className="text-sm font-semibold flex items-center gap-2 mb-4 text-ink-900">
        <ShieldAlert size={18} className="text-amber-600" /> Stay safe on ADY Marketplace
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {TIPS.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-2.5 bg-white/70 rounded-lg p-3">
            <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Icon size={14} />
            </span>
            <p className="text-xs text-ink-700 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}