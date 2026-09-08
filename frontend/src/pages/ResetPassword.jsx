import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { api } from "../api/client";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await api.resetPassword({ token, password });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <p className="text-sm text-ink-500">This reset link is missing its token. Request a new one from the <Link to="/forgot-password" className="text-brand-600 underline">forgot password</Link> page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-semibold mb-1">Choose a new password</h1>
      <p className="text-sm text-ink-500 mb-6">Reset links expire after 30 minutes.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">New password</label>
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Confirm password</label>
          <input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={submitting}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-md py-2.5 text-sm font-medium disabled:opacity-60"
        >
          {submitting ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
