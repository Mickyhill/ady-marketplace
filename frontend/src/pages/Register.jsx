import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", department: "", faculty: "", matricNumber: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-semibold mb-1">Create your account</h1>
      <p className="text-sm text-ink-500 mb-6">Join fellow AKSU students buying and selling on campus.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">Full name</label>
          <input required value={form.name} onChange={update("name")} className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Email</label>
          <input type="email" required value={form.email} onChange={update("email")} className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Password</label>
          <input type="password" required minLength={8} value={form.password} onChange={update("password")} className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm" />
          <p className="text-xs text-ink-500 mt-1">At least 8 characters.</p>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Phone (optional)</label>
          <input value={form.phone} onChange={update("phone")} className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium block mb-1">Department</label>
            <input value={form.department} onChange={update("department")} className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Faculty</label>
            <input value={form.faculty} onChange={update("faculty")} className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Matric number (optional)</label>
          <input value={form.matricNumber} onChange={update("matricNumber")} className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm" />
          <p className="text-xs text-ink-500 mt-1">Adding this queues your account for admin verification and unlocks a verified badge.</p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={submitting}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-md py-2.5 text-sm font-medium disabled:opacity-60"
        >
          {submitting ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="text-sm mt-4 text-center">
        Already have an account? <Link to="/login" className="text-brand-600 hover:underline">Log in</Link>
      </p>
    </div>
  );
}
