import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MessageCircleQuestion } from "lucide-react";

// Sits site-wide, bottom-right. Hidden on the Help page itself (no point
// floating a button to the page you're already on) and on Messages (would
// visually collide with the chat UI).
export default function FloatingContactButton() {
  const location = useLocation();
  if (location.pathname === "/help" || location.pathname === "/messages") return null;

  return (
    <Link
      to="/help"
      className="fixed bottom-5 right-5 z-40 bg-brand-500 hover:bg-brand-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
      aria-label="Help and support"
      title="Help and support"
    >
      <MessageCircleQuestion size={24} />
    </Link>
  );
}
