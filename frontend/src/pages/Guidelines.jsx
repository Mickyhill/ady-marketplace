import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

const DO = [
  "List items you actually own, with honest photos and descriptions",
  "Respond to messages promptly and courteously",
  "Keep payment and important conversations on ADY Marketplace",
  "Meet in safe, public campus locations for handoffs",
  "Leave honest reviews after a transaction",
];

const DONT = [
  "List stolen, counterfeit, or illegal items",
  "Ask buyers to pay outside the platform to avoid fees",
  "Share your OTP or password with anyone",
  "Create multiple accounts to fake reviews or trust signals",
  "Harass, threaten, or discriminate against other students",
];

export default function Guidelines() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-sm">
      <h1 className="text-2xl font-semibold mb-2">Community Guidelines</h1>
      <p className="text-ink-500 mb-6">ADY Marketplace works because AKSU students trust each other. These
      guidelines keep it that way — violations can lead to account suspension.</p>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-green-200 bg-green-50 rounded-lg p-4">
          <p className="font-semibold flex items-center gap-2 mb-2"><CheckCircle2 size={16} className="text-green-600" /> Do</p>
          <ul className="space-y-1.5 list-disc list-inside">
            {DO.map((d) => <li key={d}>{d}</li>)}
          </ul>
        </div>
        <div className="border border-red-200 bg-red-50 rounded-lg p-4">
          <p className="font-semibold flex items-center gap-2 mb-2"><XCircle size={16} className="text-red-600" /> Don't</p>
          <ul className="space-y-1.5 list-disc list-inside">
            {DONT.map((d) => <li key={d}>{d}</li>)}
          </ul>
        </div>
      </div>

      <p className="text-ink-500 text-xs mt-8">See a violation? Use the "Report this listing" button on any listing, or contact an admin directly.</p>
    </div>
  );
}
