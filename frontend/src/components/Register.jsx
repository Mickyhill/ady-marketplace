import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";
import { Check } from "lucide-react";

const STEPS = ["Account", "Verification"];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", department: "", faculty: "", matricNumber: "",
  });
  const [idPhoto, setIdPhoto] = useState(null);
  const [idPhotoPreview, setIdPhotoPreview] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setIdPhoto(file);
    setIdPhotoPreview(URL.createObjectURL(file));
  }

  function goToStep2(e) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setStep(1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!idPhoto) {
      setError("Please upload a screenshot of your AKSU student portal dashboard.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      formData.append("studentPortalScreenshot", idPhoto);
      await register(formData);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold mb-1">Create your account</h1>
      <p className="text-sm text-ink-500 mb-6">Join ADY Marketplace to buy and sell on campus.</p>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                  i < step ? "bg-green-500 text-white" : i === step ? "bg-brand-500 text-white" : "bg-ink-100 text-ink-500"
                }`}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </span>
              <span className={`text-xs font-medium ${i === step ? "text-ink-900" : "text-ink-500"}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? "bg-green-500" : "bg-ink-100"}`} />}
          </React.Fragment>
        ))}
      </div>

      {step === 0 && (
        <form onSubmit={goToStep2} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Full name</label>
            <input required value={form.name} onChange={(e) => updateField("name", e.target.value)} className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Email</label>
            <input type="email" required value={form.email} onChange={(e) => updateField("email", e.target.value)} className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Password</label>
            <PasswordInput value={form.password} onChange={(e) => updateField("password", e.target.value)} minLength={8} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Phone number</label>
            <input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="08012345678" className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1">Department</label>
              <input value={form.department} onChange={(e) => updateField("department", e.target.value)} className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Faculty</label>
              <input value={form.faculty} onChange={(e) => updateField("faculty", e.target.value)} className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-md py-2.5 text-sm font-medium">
            Continue
          </button>
        </form>
      )}

      {step === 1 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Matric number</label>
            <input
              required value={form.matricNumber} onChange={(e) => updateField("matricNumber", e.target.value)}
              placeholder="AK20/ENG/MEC/001"
              className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm"
            />
            <p className="text-xs text-ink-500 mt-1">Format: AK&lt;year&gt;/&lt;faculty&gt;/&lt;dept&gt;/&lt;number&gt;. Only visible to admins — not shown on your public profile.</p>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">AKSU student portal screenshot</label>
            <input required type="file" accept="image/*" onChange={handlePhotoChange} className="w-full text-sm" />
            <p className="text-xs text-ink-500 mt-1">Log into your student portal at aksu.edu.ng/app and screenshot your dashboard showing your name. An admin checks this against your matric number before verifying your account. Only visible to admins.</p>
            {idPhotoPreview && (
              <img src={idPhotoPreview} className="mt-2 w-32 h-20 object-cover rounded-md border border-ink-300/40" />
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(0)} className="flex-1 border border-ink-300 rounded-md py-2.5 text-sm font-medium hover:bg-ink-100">
              Back
            </button>
            <button
              disabled={submitting}
              className="flex-1 bg-brand-500 hover:bg-brand-600 text-white rounded-md py-2.5 text-sm font-medium disabled:opacity-60"
            >
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>
      )}

      <p className="text-sm mt-6 text-center">
        Already have an account? <Link to="/login" className="text-brand-600 hover:underline">Log in</Link>
      </p>
    </div>
  );
}
