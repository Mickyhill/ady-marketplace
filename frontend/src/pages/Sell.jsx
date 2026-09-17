import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { api } from "../api/client";
import SafetyTips from "../components/SafetyTips";

export default function Sell() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "", description: "", price: "", condition: "GOOD", location: "", categoryId: "",
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getCategories().then((d) => {
      setCategories(d.categories);
      if (d.categories[0]) setForm((f) => ({ ...f, categoryId: d.categories[0].id }));
    }).catch(() => {});
  }, []);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  function handleFiles(e) {
    const selected = Array.from(e.target.files).slice(0, 6 - files.length);
    setFiles((prev) => [...prev, ...selected]);
    setPreviews((prev) => [...prev, ...selected.map((f) => URL.createObjectURL(f))]);
    e.target.value = ""; // allow re-selecting the same file after removing it
  }

  function removePhoto(index) {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      files.forEach((f) => formData.append("images", f));
      const data = await api.createListing(formData);
      navigate(`/listing/${data.listing.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-1">List an item</h1>
      <p className="text-sm text-ink-500 mb-4">Good photos and an honest condition description sell faster.</p>
      <SafetyTips className="mb-6" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">Title</label>
          <input required value={form.title} onChange={update("title")} placeholder="e.g. 6ft Orthopedic Mattress" className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Description</label>
          <textarea required rows={4} value={form.description} onChange={update("description")} className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium block mb-1">Price (₦)</label>
            <input required type="number" min="0" value={form.price} onChange={update("price")} className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="condition" className="text-sm font-medium block mb-1">Condition</label>
            <select id="condition" value={form.condition} onChange={update("condition")} className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm">
              <option value="NEW">New</option>
              <option value="LIKE_NEW">Like new</option>
              <option value="GOOD">Used - good</option>
              <option value="FAIR">Used - fair</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="category" className="text-sm font-medium block mb-1">Category</label>
            <select id="category" value={form.categoryId} onChange={update("categoryId")} className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Location</label>
            <input required value={form.location} onChange={update("location")} placeholder="e.g. Main Campus" className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Photos (up to 6)</label>
          <input type="file" accept="image/*" multiple onChange={handleFiles} disabled={files.length >= 6} className="w-full text-sm" />
          {previews.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {previews.map((src, i) => (
                <div key={src} className="relative w-16 h-16 shrink-0">
                  <img src={src} className="w-16 h-16 object-cover rounded-md border border-ink-300/40" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute -top-1.5 -right-1.5 bg-ink-900 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
                    aria-label="Remove photo"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={submitting}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-md py-2.5 text-sm font-medium disabled:opacity-60"
        >
          {submitting ? "Publishing..." : "Publish listing"}
        </button>
      </form>
    </div>
  );
}
