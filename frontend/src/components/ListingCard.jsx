import React from "react";
import { Link } from "react-router-dom";
import { resolveUploadUrl } from "../api/client";

function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString("en-NG")}`;
}

const CONDITION_LABEL = {
  NEW: "New",
  LIKE_NEW: "Like new",
  GOOD: "Used - good",
  FAIR: "Used - fair",
};

export default function ListingCard({ listing }) {
  const image = resolveUploadUrl(listing.images?.[0]?.url);
  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group block rounded-lg border border-ink-300/40 bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-[4/3] bg-ink-100 relative overflow-hidden">
        {image ? (
          <img src={image} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-300">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
        {listing.featured && (
          <span className="absolute top-2 right-2 bg-brand-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Featured
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-brand-600">{formatNaira(listing.price)}</p>
        <p className="text-sm font-medium truncate">{listing.title}</p>
        <p className="text-xs text-ink-500">{CONDITION_LABEL[listing.condition] || listing.condition}</p>
        <p className="text-xs text-ink-500 flex items-center gap-1 mt-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          {listing.location}
        </p>
      </div>
    </Link>
  );
}

export { formatNaira, CONDITION_LABEL };
