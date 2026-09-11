import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { resolveUploadUrl } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Camera, User as UserIcon } from "lucide-react";
import Badges from "../components/Badges";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [searchParams] = useSearchParams();
  const viewingId = searchParams.get("user");
  const isOwnProfile = !viewingId || viewingId === user?.id;

  const [profile, setProfile] = useState(isOwnProfile ? user : null);
  const [reviews, setReviews] = useState([]);
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

  useEffect(() => {
    if (profile?.id) {
      api.getSellerReviews(profile.id).then((d) => setReviews(d.reviews)).catch(() => {});
    }
  }, [profile?.id]);

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
      <div className="flex items-center gap-4 mb-4">
        <button
          type="button"
          onClick={() => isOwnProfile && setEditing(true)}
          className={`relative w-20 h-20 rounded-full bg-ink-100 overflow-hidden shrink-0 flex items-center justify-center ${isOwnProfile ? "cursor-pointer group" : ""}`}
          aria-label={isOwnProfile ? "Add or change profile photo" : undefined}
        >
          {profile.avatarUrl ? (
            <img src={resolveUploadUrl(profile.avatarUrl)} className="w-full h-full object-cover" />
          ) : (
            <UserIcon size={32} className="text-ink-300" />
          )}
          {isOwnProfile && (
            <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
              <Camera size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
          )}
        </button>
        <div>
          <h1 className="text-xl font-semibold">{profile.name}</h1>
          {profile.ratingCount > 0 && (
            <p className="text-sm text-ink-500">{profile.rating.toFixed(1)}★ ({profile.ratingCount} reviews)</p>
          )}
          {isOwnProfile && !profile.avatarUrl && (
            <button onClick={() => setEditing(true)} className="text-xs text-brand-600 hover:underline mt-1">
              + Add a profile photo
            </button>
          )}
        </div>
      </div>

      <div className="mb-6"><Badges badges={profile.badges} /></div>

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

      {reviews.length > 0 && (
        <div className="mt-8 border-t border-ink-300/40 pt-6">
          <h2 className="text-sm font-semibold mb-3">Reviews ({reviews.length})</h2>
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="text-sm border border-ink-300/40 rounded-md p-3">
                <p className="font-medium">{r.reviewer.name} <span className="text-ink-500 font-normal">on {r.listing.title}</span></p>
                <p className="text-xs text-ink-500 mt-1">
                  {r.itemMatched ? "✓ Item matched description" : "✗ Item didn't match description"} · Communication {r.communication}/5 · Experience {r.experience}/5
                </p>
                {r.comment && <p className="mt-1">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
