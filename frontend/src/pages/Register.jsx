import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", department: "", faculty: "", matricNumber: "",
  });
  const [idPhoto, setIdPhoto] = useState(null);
  const [idPhotoPreview, setIdPhotoPreview] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    setIdPhoto(file || null);
    setIdPhotoPreview(file ? URL.createObjectURL(file) : "");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!idPhoto) {
      setError("Please upload a photo of your student ID card.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      formData.append("studentIdPhoto", idPhoto);
      await register(formData);
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
          <label className="text-sm font-medium block mb-1">Matric number</label>
          <input
            required
            value={form.matricNumber}
            onChange={update("matricNumber")}
            placeholder="AK20/ENG/MEC/001"
            className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm"
          />
          <p className="text-xs text-ink-500 mt-1">Format: AK&lt;year&gt;/&lt;faculty&gt;/&lt;dept&gt;/&lt;number&gt;. Only visible to admins — not shown on your public profile.</p>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Student ID card photo</label>
          <input required type="file" accept="image/*" onChange={handlePhotoChange} className="w-full text-sm" />
          <p className="text-xs text-ink-500 mt-1">An admin checks this against your matric number before verifying your account. Only visible to admins.</p>
          {idPhotoPreview && (
            <img src={idPhotoPreview} className="mt-2 w-32 h-20 object-cover rounded-md border border-ink-300/40" />
          )}
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
