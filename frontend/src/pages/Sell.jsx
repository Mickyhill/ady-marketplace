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