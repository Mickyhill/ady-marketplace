import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [devLink, setDevLink] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const data = await api.forgotPassword(email);
      setMessage(data.message);
      if (data.devResetLink) setDevLink(data.devResetLink);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-semibold mb-1">Reset your password</h1>
      <p className="text-sm text-ink-500 mb-6">Enter the email you registered with and we'll send a reset link.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">Email</label>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}
        {devLink && (
          <p className="text-xs text-ink-500 break-all">
            Dev mode (no email service configured yet): <Link to={devLink.replace(window.location.origin, "")} className="text-brand-600 underline">{devLink}</Link>
          </p>
        )}
        <button
          disabled={submitting}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-md py-2.5 text-sm font-medium disabled:opacity-60"
        >
          {submitting ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="text-sm mt-4 text-center">
        <Link to="/login" className="text-brand-600 hover:underline">Back to log in</Link>
      </p>
    </div>
  );
}
