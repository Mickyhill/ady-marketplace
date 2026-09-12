import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import NavBar from "./components/NavBar";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Sell from "./pages/Sell";
import MyListings from "./pages/MyListings";
import ListingDetail from "./pages/ListingDetail";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import TransactionCallback from "./pages/TransactionCallback";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Guidelines from "./pages/Guidelines";
import FAQ from "./pages/FAQ";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
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
        </Routes>
      </main>
      <footer className="border-t border-ink-300/40 py-6 text-center text-xs text-ink-500">
        <p className="mb-2">ADY Marketplace — built by and for AKSU students.</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/faq" className="hover:underline">FAQ</Link>
          <Link to="/guidelines" className="hover:underline">Community Guidelines</Link>
          <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
          <Link to="/terms" className="hover:underline">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
