import { Sofa, Cpu, BookOpen, Shirt, UtensilsCrossed, DoorOpen, Bike, Wrench, Package } from "lucide-react";

// Maps a category name (case-insensitive) to a real icon + a tint color, so
// "Services" shows a wrench, "Books" shows an open book, etc. Falls back to
// a generic package icon for any category name not listed here — add new
// categories to this map as you add them to the database.
export const CATEGORY_ICON_MAP = {
  furniture: { icon: Sofa, tint: "bg-amber-100 text-amber-700" },
  electronics: { icon: Cpu, tint: "bg-sky-100 text-sky-700" },
  books: { icon: BookOpen, tint: "bg-emerald-100 text-emerald-700" },
  fashion: { icon: Shirt, tint: "bg-pink-100 text-pink-700" },
  kitchen: { icon: UtensilsCrossed, tint: "bg-orange-100 text-orange-700" },
  hostel: { icon: DoorOpen, tint: "bg-violet-100 text-violet-700" },
  vehicles: { icon: Bike, tint: "bg-teal-100 text-teal-700" },
  services: { icon: Wrench, tint: "bg-red-100 text-red-700" },
};

export function getCategoryIcon(name = "") {
  return CATEGORY_ICON_MAP[name.toLowerCase()] || { icon: Package, tint: "bg-ink-100 text-ink-700" };
}
