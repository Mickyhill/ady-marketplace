import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { resolveUploadUrl } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [searchParams] = useSearchParams();
  const viewingId = searchParams.get("user");
  const isOwnProfile = !viewingId || viewingId === user?.id;

  const [profile, setProfile] = useState(isOwnProfile ? user : null);
  const [form, setForm] = useState({ name: "", phone: "", department: "", faculty: "", bio: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (isOwnProfile) {
      setProfile(user);
      if (user) setForm({ name: user.name, phone: user.phone || "", department: user.department || "", faculty: user.faculty || "", bio: user.bio || "" });
    } else {
      api.getUser(viewingId).then((d) => setProfile(d.user));
    }
  }, [viewingId, user]);

  async function handleSave(e) {
    e.preventDefault();
    setStatus("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (avatarFile) formData.append("avatar", avatarFile);
      const data = await api.updateProfile(formData);
      setUser(data.user);
      setEditing(false);
      setStatus("Profile updated.");
    } catch (err) {
      setStatus(err.message);
    }
  }

  if (!profile) return <div className="max-w-lg mx-auto px-4 py-16 text-center text-sm text-ink-500">Loading...</div>;

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-ink-100 overflow-hidden">
          {profile.avatarUrl && <img src={resolveUploadUrl(profile.avatarUrl)} className="w-full h-full object-cover" />}
        </div>
        <div>
          <h1 className="text-xl font-semibold">{profile.name}</h1>
          <p className="text-sm text-ink-500">
            {profile.verificationStatus === "VERIFIED" ? "✓ Verified student" : "Unverified"}
            {profile.ratingCount > 0 && ` · ${profile.rating.toFixed(1)}★ (${profile.ratingCount} reviews)`}
          </p>
        </div>
      </div>

      {profile.bio && <p className="text-sm mb-6">{profile.bio}</p>}

      {isOwnProfile && !editing && (
        <button onClick={() => setEditing(true)} className="text-sm border border-ink-300 rounded-md px-4 py-2 hover:bg-ink-100">
          Edit profile
        </button>
      )}

      {isOwnProfile && editing && (
        <form onSubmit={handleSave} className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium block mb-1">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1">Department</label>
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Faculty</label>
              <input value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Bio</label>
            <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Avatar</label>
            <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} className="w-full text-sm" />
          </div>
          <div className="flex gap-2">
            <button className="bg-brand-500 hover:bg-brand-600 text-white rounded-md px-4 py-2 text-sm">Save</button>
            <button type="button" onClick={() => setEditing(false)} className="border border-ink-300 rounded-md px-4 py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}

      {status && <p className="text-sm text-ink-500 mt-3">{status}</p>}
    </div>
  );
}
