import React, { useState } from "react";
import { api } from "../api/client";
import { Mail } from "lucide-react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setStatus("");
    setSubmitting(true);
    try {
      const data = await api.subscribeNewsletter(email);
      setStatus(data.message);
      setEmail("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-ink-900 text-white rounded-lg p-6">
      <p className="font-display font-semibold text-lg flex items-center gap-2 mb-1">
        <Mail size={18} /> Stay in the loop
      </p>
      <p className="text-sm text-ink-300 mb-4">Campus deals and new features, straight to your inbox. No spam.</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-md px-3 py-2 text-sm text-ink-900"
        />
        <button disabled={submitting} className="bg-brand-500 hover:bg-brand-600 rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60">
          {submitting ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      {status && <p className="text-sm text-green-400 mt-2">{status}</p>}
      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
    </div>
  );
}
