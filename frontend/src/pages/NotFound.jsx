import React from "react";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center mx-auto mb-6">
        <Compass size={28} />
      </div>
      <h1 className="text-3xl font-semibold mb-2">Page not found</h1>
      <p className="text-sm text-ink-500 mb-8">
        This page doesn't exist. Maybe the link's outdated, or you typed something wrong. Head back to the homepage and try again.
      </p>
      <Link to="/" className="inline-block bg-brand-500 hover:bg-brand-600 text-white rounded-md px-5 py-2.5 text-sm font-medium">
        Back to homepage
      </Link>
    </div>
  );
}
