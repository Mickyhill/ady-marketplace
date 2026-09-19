import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Upload,
  ImagePlus,
  MapPin,
  Tag,
  Banknote,
  Sparkles,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { api } from "../api/client";
import SafetyTips from "../components/SafetyTips";

export default function Sell() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    condition: "GOOD",
    location: "",
    categoryId: "",
  });

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [dragActive, setDragActive] = useState(false);

  /*
   * Load categories
   */
  useEffect(() => {
    api
      .getCategories()
      .then((d) => {
        setCategories(d.categories);

        if (d.categories[0]) {
          setForm((f) => ({
            ...f,
            categoryId: d.categories[0].id,
          }));
        }
      })
      .catch(() => {});
  }, []);

  /*
   * Clean up preview URLs when component unmounts.
   */
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function update(field) {
    return (e) => {
      setForm((current) => ({
        ...current,
        [field]: e.target.value,
      }));
    };
  }

  /*
   * Add selected images.
   */
  function addFiles(selectedFiles) {
    const incoming = Array.from(selectedFiles)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 6 - files.length);

    if (!incoming.length) return;

    setFiles((previous) => [
      ...previous,
      ...incoming,
    ]);

    setPreviews((previous) => [
      ...previous,
      ...incoming.map((file) =>
        URL.createObjectURL(file)
      ),
    ]);
  }

  function handleFiles(e) {
    addFiles(e.target.files);

    /*
     * Allows the same image to be selected again
     * after removing it.
     */
    e.target.value = "";
  }

  function handleDragOver(e) {
    e.preventDefault();

    if (files.length < 6) {
      setDragActive(true);
    }
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setDragActive(false);
  }

  function handleDrop(e) {
    e.preventDefault();

    setDragActive(false);

    if (files.length >= 6) return;

    addFiles(e.dataTransfer.files);
  }

  /*
   * Remove photo.
   */
  function removePhoto(index) {
    const previewToRemove = previews[index];

    if (previewToRemove) {
      URL.revokeObjectURL(previewToRemove);
    }

    setFiles((previous) =>
      previous.filter((_, i) => i !== index)
    );

    setPreviews((previous) =>
      previous.filter((_, i) => i !== index)
    );
  }

  /*
   * Submit listing.
   */
  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      files.forEach((file) => {
        formData.append("images", file);
      });

      const data = await api.createListing(formData);

      navigate(`/listing/${data.listing.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * Determine how complete the listing is.
   */
  const completedFields = [
    form.title,
    form.description,
    form.price,
    form.categoryId,
    form.location,
  ].filter(Boolean).length;

  const progress = Math.round(
    (completedFields / 5) * 100
  );

  return (
    <div className="min-h-screen bg-ink-50/40">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="animate-fade-up mb-8">

          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 rounded-full px-3 py-1.5 text-xs font-semibold mb-4">
            <Sparkles size={14} />
            Sell on ADY Marketplace
          </div>

          <h1 className="text-3xl font-bold text-ink-900 tracking-tight">
            List an item
          </h1>

          <p className="text-sm text-ink-500 mt-2 max-w-lg">
            Good photos and an honest condition description help
            buyers understand exactly what you're selling.
          </p>
        </div>

        {/* =====================================================
            PROGRESS
        ====================================================== */}
        <div className="bg-white border border-ink-200/60 rounded-xl p-4 mb-6 shadow-sm animate-fade-up-delay">

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2
                size={16}
                className={
                  progress === 100
                    ? "text-green-500"
                    : "text-brand-500"
                }
              />

              <span className="text-xs font-semibold text-ink-700">
                Listing progress
              </span>
            </div>

            <span className="text-xs text-ink-500">
              {progress}%
            </span>
          </div>

          <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        {/* =====================================================
            FORM
        ====================================================== */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* ===================================================
              BASIC INFORMATION
          ==================================================== */}
          <section className="bg-white border border-ink-200/60 rounded-2xl p-5 shadow-sm animate-section">

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <Tag
                  size={19}
                  className="text-brand-600"
                />
              </div>

              <div>
                <h2 className="font-semibold text-ink-900">
                  What are you selling?
                </h2>

                <p className="text-xs text-ink-500">
                  Give buyers the important details.
                </p>
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="text-sm font-medium block mb-1.5">
                Title
              </label>

              <input
                required
                value={form.title}
                onChange={update("title")}
                placeholder="e.g. 6ft Orthopedic Mattress"
                className="w-full border border-ink-300/60 rounded-lg px-3 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Description
              </label>

              <textarea
                required
                rows={5}
                value={form.description}
                onChange={update("description")}
                placeholder="Describe the item, its condition, age, features, and anything a buyer should know."
                className="w-full border border-ink-300/60 rounded-lg px-3 py-2.5 text-sm outline-none transition-all resize-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
              />

              <p className="text-[11px] text-ink-400 mt-1.5">
                Be honest about the item's condition.
              </p>
            </div>
          </section>

          {/* ===================================================
              PRICE AND CONDITION
          ==================================================== */}
          <section
            className="bg-white border border-ink-200/60 rounded-2xl p-5 shadow-sm animate-section"
            style={{
              animationDelay: "100ms",
            }}
          >

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <Banknote
                  size={19}
                  className="text-brand-600"
                />
              </div>

              <div>
                <h2 className="font-semibold text-ink-900">
                  Price and condition
                </h2>

                <p className="text-xs text-ink-500">
                  Help buyers know what to expect.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Price */}
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Price (₦)
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">
                    ₦
                  </span>

                  <input
                    required
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={update("price")}
                    placeholder="60,000"
                    className="w-full border border-ink-300/60 rounded-lg pl-8 pr-3 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
                  />
                </div>
              </div>

              {/* Condition */}
              <div>
                <label
                  htmlFor="condition"
                  className="text-sm font-medium block mb-1.5"
                >
                  Condition
                </label>

                <select
                  id="condition"
                  value={form.condition}
                  onChange={update("condition")}
                  className="w-full border border-ink-300/60 rounded-lg px-3 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 bg-white"
                >
                  <option value="NEW">
                    New
                  </option>

                  <option value="LIKE_NEW">
                    Like new
                  </option>

                  <option value="GOOD">
                    Used - good
                  </option>

                  <option value="FAIR">
                    Used - fair
                  </option>
                </select>
              </div>
            </div>
          </section>

          {/* ===================================================
              CATEGORY AND LOCATION
          ==================================================== */}
          <section
            className="bg-white border border-ink-200/60 rounded-2xl p-5 shadow-sm animate-section"
            style={{
              animationDelay: "200ms",
            }}
          >

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <MapPin
                  size={19}
                  className="text-brand-600"
                />
              </div>

              <div>
                <h2 className="font-semibold text-ink-900">
                  Where is the item?
                </h2>

                <p className="text-xs text-ink-500">
                  Help nearby buyers find you.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="text-sm font-medium block mb-1.5"
                >
                  Category
                </label>

                <select
                  id="category"
                  value={form.categoryId}
                  onChange={update("categoryId")}
                  className="w-full border border-ink-300/60 rounded-lg px-3 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 bg-white"
                >
                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Location
                </label>

                <input
                  required
                  value={form.location}
                  onChange={update("location")}
                  placeholder="e.g. Main Campus"
                  className="w-full border border-ink-300/60 rounded-lg px-3 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
                />
              </div>
            </div>
          </section>

          {/* ===================================================
              PHOTOS
          ==================================================== */}
          <section
            className="bg-white border border-ink-200/60 rounded-2xl p-5 shadow-sm animate-section"
            style={{
              animationDelay: "300ms",
            }}
          >

            <div className="flex items-center justify-between mb-5">

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                  <ImagePlus
                    size={19}
                    className="text-brand-600"
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-ink-900">
                    Add photos
                  </h2>

                  <p className="text-xs text-ink-500">
                    Up to 6 photos
                  </p>
                </div>
              </div>

              <span className="text-xs font-medium text-ink-400">
                {files.length}/6
              </span>
            </div>

            {/* Upload area */}
            <label
              htmlFor="photos"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative block border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? "border-brand-500 bg-brand-50 scale-[1.01]"
                  : "border-ink-200 hover:border-brand-400 hover:bg-brand-50/40"
              } ${
                files.length >= 6
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >

              <input
                id="photos"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles}
                disabled={files.length >= 6}
                className="sr-only"
              />

              <div className="flex flex-col items-center">

                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all ${
                    dragActive
                      ? "bg-brand-500 text-white scale-110"
                      : "bg-brand-50 text-brand-600"
                  }`}
                >
                  <Upload size={21} />
                </div>

                <p className="text-sm font-semibold text-ink-800">
                  {dragActive
                    ? "Drop your photos here"
                    : "Upload photos"}
                </p>

                <p className="text-xs text-ink-400 mt-1">
                  Click to browse or drag and drop
                </p>

                <p className="text-[11px] text-ink-400 mt-2">
                  JPG, PNG, WEBP
                </p>
              </div>
            </label>

            {/* =================================================
                PHOTO PREVIEWS
            ================================================== */}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">

                {previews.map((src, index) => (
                  <div
                    key={src}
                    className="group relative aspect-square rounded-lg overflow-hidden border border-ink-200 animate-photo-in"
                  >
                    <img
                      src={src}
                      alt={`Listing preview ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() =>
                        removePhoto(index)
                      }
                      className="absolute top-1 right-1 w-6 h-6 bg-black/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label={`Remove photo ${index + 1}`}
                    >
                      <X size={13} />
                    </button>

                    {/* First image badge */}
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {files.length >= 6 && (
              <p className="text-xs text-ink-400 mt-3 text-center">
                You've reached the 6-photo limit.
              </p>
            )}
          </section>

          {/* ===================================================
              ERROR
          ==================================================== */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 animate-shake">
              {error}
            </div>
          )}

          {/* ===================================================
              PUBLISH
          ==================================================== */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white rounded-xl py-3.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-lg"
          >
            {submitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2
                  size={17}
                  className="animate-spin"
                />

                Publishing your listing...
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                <Upload size={17} />

                Publish listing
              </span>
            )}
          </button>
        </form>

        {/* =====================================================
            SAFETY TIPS
        ====================================================== */}
        <div
          className="mt-8 animate-section"
          style={{
            animationDelay: "400ms",
          }}
        >
          <SafetyTips />
        </div>
      </div>

      {/* =====================================================
          ANIMATION STYLES
      ====================================================== */}
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes photoIn {
          from {
            opacity: 0;
            transform: scale(0.85) translateY(8px);
          }

          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }

          25% {
            transform: translateX(-4px);
          }

          75% {
            transform: translateX(4px);
          }
        }

        @keyframes floatSlow {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(-15px, -15px, 0) scale(1.03);
          }
        }

        .animate-fade-up {
          animation: fadeUp 0.55s ease-out both;
        }

        .animate-fade-up-delay {
          animation: fadeUp 0.55s ease-out 0.08s both;
        }

        .animate-section {
          animation: fadeUp 0.55s ease-out both;
        }

        .animate-photo-in {
          animation: photoIn 0.35s ease-out both;
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}