import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Star, Search } from "lucide-react";
import { api } from "../api/client";
import ListingCard from "../components/ListingCard";
import { getCategoryIcon } from "../components/categoryIcons";
import SafetyTips from "../components/SafetyTips";
import LoadingSpinner from "../components/LoadingSpinner";

const FALLBACK_CATEGORIES = [
  { id: "Furniture", name: "Furniture" },
  { id: "Electronics", name: "Electronics" },
  { id: "Books", name: "Books" },
  { id: "Fashion", name: "Fashion" },
  { id: "Kitchen", name: "Kitchen" },
  { id: "Hostel", name: "Hostel" },
  { id: "Vehicles", name: "Vehicles" },
  { id: "Services", name: "Services" },
];

export default function Home() {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [featured, setFeatured] = useState([]);
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getCategories().then((d) => {
      if (!d.categories?.length) return;
      setCategories(d.categories);
      const categoryName = searchParams.get("category");
      if (categoryName) {
        const match = d.categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
        if (match) setActiveCategory(match.id);
      }
    }).catch(() => {});
    api.getListings({ featured: "true", pageSize: 3 }).then((d) => setFeatured(d.listings)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .getListings({ q: query, category: activeCategory, sort })
      .then((d) => {
        setListings(d.listings);
        setTotal(d.total);
      })
      .catch(() => setError("Couldn't load listings. Is the backend running?"))
      .finally(() => setLoading(false));
  }, [query, activeCategory, sort]);

  return (
    <div>
      <section className="relative overflow-hidden bg-ink-900 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, white 0, transparent 40%), radial-gradient(circle at 85% 30%, white 0, transparent 35%), radial-gradient(circle at 50% 90%, white 0, transparent 45%)",
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold">
            Buy, sell, and connect <span className="text-brand-100 underline decoration-white/30">on campus</span>
          </h1>
          <p className="mt-4 text-white/80 max-w-xl mx-auto">
            Trusted listings from verified AKSU students. Buy what you need from students around campus.
          </p>
          <p className="mt-2 text-white/70 max-w-xl mx-auto text-sm">
            Find what students are selling. From books and fridges to mattresses and more, shop from verified AKSU students.
          </p>
          <p className="mt-2 text-white/70 max-w-xl mx-auto text-sm">
            Buy and sell with verified AKSU students. Find useful items around campus, all in one place.
          </p>
          <div className="mt-8 max-w-xl mx-auto">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-3 shadow-lg">
              <Search size={18} className="text-ink-500 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 'mattress', 'fridge', 'textbook'..."
                className="flex-1 outline-none text-sm bg-transparent text-ink-900"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-lg font-semibold mb-4">Browse categories</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-10">
          {categories.map((c) => {
            const { icon: Icon, tint } = getCategoryIcon(c.name);
            const active = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(active ? null : c.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-xs font-medium transition-colors ${
                  active ? "border-brand-500 bg-brand-50 text-brand-600" : "border-ink-300/40 hover:bg-ink-100 bg-white"
                }`}
              >
                <span className={`w-10 h-10 rounded-full flex items-center justify-center ${tint}`}>
                  <Icon size={18} strokeWidth={2} />
                </span>
                {c.name}
              </button>
            );
          })}
        </div>

        {featured.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star size={18} className="text-yellow-500 fill-yellow-400" /> Featured listings
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {featured.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {activeCategory ? `${activeCategory}` : "Latest listings"} <span className="text-ink-500 font-normal">({total})</span>
          </h2>
          <label htmlFor="sort-listings" className="sr-only">Sort listings</label>
          <select
            id="sort-listings"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-sm border border-ink-300/50 rounded-full px-3 py-2 bg-white"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        {loading ? (
          <LoadingSpinner label="Loading listings..." />
        ) : listings.length === 0 ? (
          <p className="text-sm text-ink-500">No listings match yet. Try a different search or category.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}

        <Link to="/register" className="block mt-10 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
          <img src="/social-banner.png" alt="Buy, sell, and connect — all on campus. Join ADY Marketplace today." width="1200" height="630" className="w-full h-auto block" />
        </Link>

        <SafetyTips className="mt-10" />
      </div>
    </div>
  );
}
