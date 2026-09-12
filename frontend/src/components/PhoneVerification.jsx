import React, { useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Phone, CheckCircle2 } from "lucide-react";

export default function PhoneVerification() {
  const { user, setUser } = useAuth();
  const [phone, setPhone] = useState(user?.phone || "");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("idle"); // idle | sent | done
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user?.badges?.phoneVerified) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700">
        <CheckCircle2 size={16} /> Phone verified
      </div>
    );
  }

  async function handleSend(e) {
    e.preventDefault();
    setStatus("");
    setSubmitting(true);
    try {
      await api.sendPhoneOtp(phone);
      setStep("sent");
      setStatus("Code sent — check your phone (or, if SMS isn't configured yet, ask your admin to check the server logs).");
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setStatus("");
    setSubmitting(true);
    try {
      await api.verifyPhoneOtp(code);
      setUser({ ...user, badges: { ...user.badges, phoneVerified: true } });
      setStep("done");
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border border-ink-300/40 rounded-md p-3 text-sm">
      <p className="font-medium flex items-center gap-2 mb-2"><Phone size={14} /> Verify your phone number</p>
      {step === "idle" && (
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08012345678"
            className="flex-1 border border-ink-300/50 rounded-md px-2 py-1.5 text-sm"
          />
          <button disabled={submitting} className="text-xs bg-brand-500 text-white rounded-md px-3 py-1.5 disabled:opacity-60">
            Send code
          </button>
        </form>
      )}
      {step === "sent" && (
        <form onSubmit={handleVerify} className="flex gap-2">
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            className="flex-1 border border-ink-300/50 rounded-md px-2 py-1.5 text-sm"
          />
          <button disabled={submitting} className="text-xs bg-brand-500 text-white rounded-md px-3 py-1.5 disabled:opacity-60">
            Verify
          </button>
        </form>
      )}
      {status && <p className="text-xs text-ink-500 mt-2">{status}</p>}
    </div>
  );
}