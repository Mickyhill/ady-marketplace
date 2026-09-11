import React from "react";
import { Phone, ShieldCheck, BadgeCheck, Award } from "lucide-react";

// Renders whichever badges are true. Deliberately compact — this shows up
// next to seller names in several places (listing detail, profile, reviews).
export default function Badges({ badges, size = "sm" }) {
  if (!badges) return null;
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const iconSize = size === "sm" ? 12 : 14;

  const items = [
    badges.phoneVerified && { icon: Phone, label: "Phone Verified", tint: "bg-orange-100 text-orange-700" },
    badges.aksuVerified && { icon: ShieldCheck, label: "AKSU Verified", tint: "bg-green-100 text-green-700" },
    badges.identityVerified && { icon: BadgeCheck, label: "Identity Verified", tint: "bg-blue-100 text-blue-700" },
    badges.trustedSeller && { icon: Award, label: "Trusted Seller", tint: "bg-yellow-100 text-yellow-800" },
  ].filter(Boolean);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(({ icon: Icon, label, tint }) => (
        <span key={label} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${textSize} ${tint}`}>
          <Icon size={iconSize} />
          {label}
        </span>
      ))}
    </div>
  );
}
