import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "ady_cookie_notice_dismissed";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-ink-900 text-white px-4 py-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-3 text-sm">
        <p className="flex-1">
          ADY Marketplace uses cookies to keep you logged in and remember your preferences. By using the site, you agree to this. See our{" "}
          <Link to="/privacy" className="underline">Privacy Policy</Link>.
        </p>
        <button onClick={dismiss} className="bg-brand-500 hover:bg-brand-600 rounded-md px-4 py-2 font-medium shrink-0">
          Got it
        </button>
      </div>
    </div>
  );
}
