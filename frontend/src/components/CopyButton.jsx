import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ text, label = "Copy link" }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail (e.g. insecure context) — fail quietly
      // rather than show a scary error for a non-critical convenience action.
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs border border-ink-300 rounded-md px-3 py-1.5 hover:bg-ink-100"
    >
      {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
      {copied ? "Copied!" : label}
    </button>
  );
}
