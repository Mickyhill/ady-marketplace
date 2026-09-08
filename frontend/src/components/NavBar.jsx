import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <header className="border-b border-ink-300/40 bg-white/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          {/* Drop your real AKSU logo file at frontend/public/aksu-logo.png and
              this will pick it up automatically. Until then, it falls back to
              the letter badge below. */}
          {!logoFailed ? (
            <img
              src="/aksu-logo.png"
              alt="AKSU"
              className="w-9 h-9 rounded-md object-contain bg-white"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span className="w-9 h-9 rounded-md bg-brand-500 text-white flex items-center justify-center font-display font-semibold">M</span>
          )}
          <span>
            <span className="font-display font-semibold text-lg leading-none block">MyMarketPlace</span>
            <span className="text-xs text-ink-500 leading-none">AKSU Campus</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link to="/" className="px-3 py-2 rounded-md hover:bg-ink-100">Browse</Link>
          <Link to="/sell" className="px-3 py-2 rounded-md hover:bg-ink-100">Sell</Link>
          {user && <Link to="/messages" className="px-3 py-2 rounded-md hover:bg-ink-100">Messages</Link>}
          {user && <Link to="/my-listings" className="px-3 py-2 rounded-md hover:bg-ink-100">My Listings</Link>}
          {user?.role === "ADMIN" && <Link to="/admin" className="px-3 py-2 rounded-md hover:bg-ink-100">Admin</Link>}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/profile" className="text-sm px-3 py-2 rounded-md hover:bg-ink-100 hidden sm:block">
                {user.name.split(" ")[0]}
              </Link>
              <button
                onClick={() => { logout(); navigate("/"); }}
                className="text-sm px-3 py-2 rounded-md border border-ink-300 hover:bg-ink-100"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm px-3 py-2 rounded-md hover:bg-ink-100">Log in</Link>
              <Link to="/register" className="text-sm px-3 py-2 rounded-md bg-brand-500 text-white hover:bg-brand-600">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
