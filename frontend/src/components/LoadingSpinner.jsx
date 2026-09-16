import React from "react";

// A branded loading indicator — replaces plain "Loading..." text across the
// site. Respects prefers-reduced-motion automatically via the global
// animation-duration override in index.css.
export default function LoadingSpinner({ label = "Loading...", size = "md" }) {
  const dims = size === "sm" ? "w-4 h-4 border-2" : size === "lg" ? "w-10 h-10 border-4" : "w-6 h-6 border-[3px]";
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-ink-500 text-sm">
      <span
        className={`${dims} rounded-full border-brand-200 border-t-brand-500 animate-spin`}
        role="status"
        aria-label={label}
      />
      {label && <span>{label}</span>}
    </div>
  );
}
