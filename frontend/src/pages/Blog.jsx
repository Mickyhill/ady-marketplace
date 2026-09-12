import React from "react";
import { Link } from "react-router-dom";

export default function Blog() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center text-sm">
      <h1 className="text-2xl font-semibold mb-2">Blog</h1>
      <p className="text-ink-500">Guides on buying, selling, and staying safe on campus are coming soon.</p>
      <Link to="/faq" className="inline-block mt-4 text-brand-600 underline">Check the FAQ in the meantime</Link>
    </div>
  );
}