import React from "react";
import { ShieldAlert } from "lucide-react";

const TIPS = [
  "ADY Marketplace never asks you to pay into a personal staff account.",
  "Never share your OTP or password. Not with anyone.",
  "Inspect expensive items in person before you pay.",
  "See something suspicious? Report it right away.",
  "Keep your chats on ADY Marketplace, not WhatsApp.",
];

export default function SafetyTips({ className = "" }) {
  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
      <p className="text-sm font-medium flex items-center gap-2 mb-2">
        <ShieldAlert size={16} className="text-amber-600" /> Stay safe on ADY Marketplace
      </p>
      <ul className="text-xs text-ink-700 space-y-1 list-disc list-inside">
        {TIPS.map((tip) => <li key={tip}>{tip}</li>)}
      </ul>
    </div>
  );
}
