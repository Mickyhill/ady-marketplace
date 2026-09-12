import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoFailed, setLogoFailed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = (
    <>
      <Link to="/" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-md hover:bg-ink-100">Browse</Link>
      <Link to="/sell" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-md hover:bg-ink-100">Sell</Link>
      {user && <Link to="/messages" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-md hover:bg-ink-100">Messages</Link>}
      {user && <Link to="/my-listings" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-md hover:bg-ink-100">My Listings</Link>}
      {user?.role === "ADMIN" && <Link to="/admin" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-md hover:bg-ink-100">Admin</Link>}
    </>
  );

  return (
    <header className="border-b border-ink-300/40 bg-white/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
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
            <span className="font-display font-semibold text-lg leading-none block">ADY Marketplace</span>
            <span className="text-xs text-ink-500 leading-none">AKSU Campus</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          {navLinks}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link to="/profile" className="text-sm px-3 py-2 rounded-md hover:bg-ink-100">
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

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-md hover:bg-ink-100"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-ink-300/40 bg-white px-4 py-3 flex flex-col gap-1 text-sm">
          {navLinks}
          <div className="border-t border-ink-300/40 my-2" />
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-md hover:bg-ink-100">
                {user.name.split(" ")[0]} (Profile)
              </Link>
              <button
                onClick={() => { logout(); setMobileOpen(false); navigate("/"); }}
                className="text-left px-3 py-2 rounded-md border border-ink-300 hover:bg-ink-100"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-md hover:bg-ink-100">Log in</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-md bg-brand-500 text-white text-center hover:bg-brand-600">
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
