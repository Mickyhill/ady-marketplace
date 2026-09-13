import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CheckCircle2 } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from || "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 min-h-[calc(100vh-104px)]">
      {/* Story panel */}
      <div className="relative bg-gradient-to-br from-brand-600 via-brand-500 to-brand-800 text-white px-8 py-12 md:py-16 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
          <defs>
            <pattern id="loginGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#loginGrid)" />
        </svg>

        <div className="relative max-w-md mx-auto md:mx-0">
          <div className="flex items-center gap-2 mb-8">
            <img src="/ady-logo.svg" alt="ADY Marketplace" className="w-10 h-10" />
            <div>
              <p className="font-display font-semibold text-lg leading-none">ADY Marketplace</p>
              <p className="text-xs text-brand-100 leading-none mt-1">AKSU Campus</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-2 bg-white text-ink-900 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-green-500" /> NOW LIVE
          </span>

          <div className="bg-white/10 border-l-4 border-white rounded-lg p-6 mb-6">
            <h2 className="font-display font-bold text-2xl mb-3">Meet Mr. Vix.</h2>
            <p className="text-brand-50 mb-3">
              He needed a mattress before resumption. Scared of getting scammed, he spent three days walking hostel to hostel.
              No luck. No guarantee he'd find one at all.
            </p>
            <p className="font-display font-bold text-lg mb-3">He didn't have to.</p>
            <p className="text-brand-50 mb-4">
              ADY Marketplace verifies every seller. Your payment stays held until you confirm the item arrived.
              Everything AKSU students sell sits in one place, searchable from your phone.
            </p>
            <p className="font-display font-bold">Don't be like Mr. Vix.</p>
          </div>

          <div className="space-y-2">
            {["Verified AKSU students only", "Secure, held payments", "Fast, local campus pickup"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 size={18} className="text-white shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
          <p className="text-sm text-ink-500 mb-6">Log in to buy, sell, and message other students.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Email</label>
              <input
                type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Password</label>
              <input
                type="password" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              disabled={submitting}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-md py-2.5 text-sm font-medium disabled:opacity-60"
            >
              {submitting ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="flex justify-between mt-4 text-sm">
            <Link to="/forgot-password" className="text-brand-600 hover:underline">Forgot password?</Link>
            <Link to="/register" className="text-brand-600 hover:underline">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
