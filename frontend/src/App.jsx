import React, { lazy, Suspense } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import NavBar from "./components/NavBar";
import WarningTicker from "./components/WarningTicker";
import FloatingContactButton from "./components/FloatingContactButton";
import CookieBanner from "./components/CookieBanner";
import NewsletterSignup from "./components/NewsletterSignup";
import LoadingSpinner from "./components/LoadingSpinner";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

// Home loads eagerly since it's the page almost every visitor lands on
// first. Everything else is code-split — a visitor just browsing listings
// never downloads the Admin dashboard's JavaScript, for example.
import Home from "./pages/Home";
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Sell = lazy(() => import("./pages/Sell"));
const MyListings = lazy(() => import("./pages/MyListings"));
const ListingDetail = lazy(() => import("./pages/ListingDetail"));
const Messages = lazy(() => import("./pages/Messages"));
const Profile = lazy(() => import("./pages/Profile"));
const Admin = lazy(() => import("./pages/Admin"));
const TransactionCallback = lazy(() => import("./pages/TransactionCallback"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Guidelines = lazy(() => import("./pages/Guidelines"));
const FAQ = lazy(() => import("./pages/FAQ"));
const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const SellerGuide = lazy(() => import("./pages/SellerGuide"));
const Help = lazy(() => import("./pages/Help"));
const NotFound = lazy(() => import("./pages/NotFound"));

const CATEGORIES = ["Furniture", "Electronics", "Books", "Fashion", "Kitchen", "Hostel", "Vehicles", "Services"];

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip-to-content link — invisible until keyboard-focused, lets
          keyboard/screen-reader users bypass the navbar and ticker */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-brand-600 focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
      >
        Skip to content
      </a>

      <NavBar />
      <WarningTicker />
      <main id="main-content" className="flex-1">
        <Suspense fallback={<LoadingSpinner label="Loading page..." />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/sell" element={<ProtectedRoute><Sell /></ProtectedRoute>} />
            <Route path="/my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/transactions/:id/callback" element={<ProtectedRoute><TransactionCallback /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/guidelines" element={<Guidelines />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/seller-guide" element={<SellerGuide />} />
            <Route path="/help" element={<Help />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <footer className="border-t border-ink-300/40 bg-white text-sm text-ink-500 no-print">
        <div className="max-w-6xl mx-auto px-4 pt-10">
          <NewsletterSignup />
        </div>
        <div className="max-w-6xl mx-auto px-4 py-10 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="font-display font-semibold text-ink-900 text-base mb-1">ADY Marketplace</p>
            <p className="text-xs mb-3">Campus Marketplace</p>
            <p className="text-xs mb-4">The trusted student marketplace for AKSU. Buy, sell, and trade safely with verified students.</p>
          </div>

          <div>
            <p className="font-semibold text-ink-900 mb-2">Quick Links</p>
            <ul className="space-y-1.5">
              <li><Link to="/about" className="hover:underline">About Us</Link></li>
              <li><Link to="/blog" className="hover:underline">Blog</Link></li>
              <li><Link to="/faq" className="hover:underline">FAQ</Link></li>
              <li><Link to="/guidelines" className="hover:underline">Safety Tips</Link></li>
              <li><Link to="/seller-guide" className="hover:underline">Seller Guide</Link></li>
              <li><Link to="/help" className="hover:underline">Help & Support</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-ink-900 mb-2">Categories</p>
            <ul className="space-y-1.5">
              {CATEGORIES.map((c) => (
                <li key={c}><Link to={`/?category=${encodeURIComponent(c)}`} className="hover:underline">{c}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold text-ink-900 mb-2">Contact</p>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0" /> AKSU Campus, Akwa Ibom, Nigeria</li>
              <li className="flex items-start gap-2"><Mail size={14} className="mt-0.5 shrink-0" /> <a href="mailto:adymarketplace76@gmail.com" className="hover:underline">adymarketplace76@gmail.com</a></li>
              <li className="flex items-start gap-2"><Phone size={14} className="mt-0.5 shrink-0" /> +234 807 156 9877 · +234 802 511 9599</li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0" aria-hidden="true">𝕏</span>
                <a href="https://x.com/AdyMarketplace" target="_blank" rel="noreferrer" className="hover:underline">@AdyMarketplace</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-ink-300/40 py-4 text-center text-xs">
          <p className="mb-2">© {new Date().getFullYear()} ADY Marketplace. All rights reserved.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link to="/terms" className="hover:underline">Terms of Service</Link>
            <Link to="/help" className="hover:underline">Contact</Link>
          </div>
        </div>
      </footer>

      <FloatingContactButton />
      <CookieBanner />
    </div>
  );
}
