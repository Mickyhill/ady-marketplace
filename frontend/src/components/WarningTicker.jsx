import React from "react";
import { AlertTriangle } from "lucide-react";

const MESSAGE = "Pay and chat through ADY Marketplace. Deals made outside the platform are not covered by our protection or support.";

export default function WarningTicker() {
  return (
    <div className="bg-ink-900 text-amber-100 overflow-hidden whitespace-nowrap py-2 text-sm">
      <div className="inline-flex animate-marquee">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="inline-flex items-center gap-2 px-8 font-medium">
            <AlertTriangle size={15} className="shrink-0" />
            {MESSAGE}
          </span>
        ))}
      </div>
    </div>
  );
}
