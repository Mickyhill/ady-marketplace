import React from "react";
import { ShieldAlert } from "lucide-react";

const TIPS = [
  "ADY Marketplace will never ask you to send payment to a personal staff account.",
  "Never share your OTP or password with anyone, including other students.",
  "Inspect expensive items in person before paying.",
  "Report suspicious sellers or listings immediately.",
  "Keep important communication within ADY Marketplace, not just WhatsApp.",
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
