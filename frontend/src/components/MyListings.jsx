import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { resolveUploadUrl } from "../api/client";
import { formatNaira } from "../components/ListingCard";
import ConfirmModal from "../components/ConfirmModal";
import LoadingSpinner from "../components/LoadingSpinner";

const STATUS_STYLE = {
  ACTIVE: "bg-green-100 text-green-700",
  SOLD: "bg-ink-100 text-ink-500",
  REMOVED: "bg-red-100 text-red-700",
  PENDING_REVIEW: "bg-yellow-100 text-yellow-700",
};

const BOOST_DURATIONS = [3, 7, 14];

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [boostingId, setBoostingId] = useState(null);
  const [boostError, setBoostError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  function load() {
    setLoading(true);
    api.getMyListings().then((d) => setListings(d.listings)).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleMarkSold(id) {
    await api.markSold(id);
    load();
  }

  function requestDelete(listing) {
    setDeleteTarget(listing);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await api.deleteListing(deleteTarget.id);
    setDeleteTarget(null);
    load();
  }

  async function handleBoost(id, days) {
    setBoostError("");
    try {
      const data = await api.createBoost(id, days);
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setBoostError(err.message);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">My listings</h1>
        <Link to="/sell" className="text-sm bg-brand-500 hover:bg-brand-600 text-white rounded-md px-4 py-2">+ New listing</Link>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading ? (
        <LoadingSpinner label="Loading your listings..." />
      ) : listings.length === 0 ? (
        <p className="text-sm text-ink-500">You haven't listed anything yet. <Link to="/sell" className="text-brand-600 underline">List your first item</Link>.</p>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => {
            const isBoosted = l.boostedUntil && new Date(l.boostedUntil) > new Date();
            return (
              <div key={l.id} className="border border-ink-300/40 rounded-lg p-3 bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-md bg-ink-100 overflow-hidden shrink-0">
                    {l.images?.[0] && <img src={resolveUploadUrl(l.images[0].url)} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/listing/${l.id}`} className="font-medium truncate block hover:underline">{l.title}</Link>
                    <p className="text-sm text-brand-600">{formatNaira(l.price)}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLE[l.status] || "bg-ink-100"}`}>
                    {l.status.replace("_", " ")}
                  </span>
                  <div className="flex gap-2 shrink-0">
                    {l.status === "ACTIVE" && (
                      <button onClick={() => handleMarkSold(l.id)} className="text-xs border border-ink-300 rounded-md px-3 py-1.5 hover:bg-ink-100">
                        Mark sold
                      </button>
                    )}
                    <button onClick={() => requestDelete(l)} className="text-xs border border-red-200 text-red-600 rounded-md px-3 py-1.5 hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </div>

                {l.status === "ACTIVE" && (
                  <div className="mt-2 pt-2 border-t border-ink-300/30">
                    {isBoosted ? (
                      <p className="text-xs text-brand-600 font-medium">⭐ Boosted until {new Date(l.boostedUntil).toLocaleDateString()}</p>
                    ) : boostingId === l.id ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-ink-500">Boost for:</span>
                        {BOOST_DURATIONS.map((d) => (
                          <button key={d} onClick={() => handleBoost(l.id, d)} className="text-xs border border-brand-300 text-brand-600 rounded-md px-2 py-1 hover:bg-brand-50">
                            {d} days
                          </button>
                        ))}
                        <button onClick={() => setBoostingId(null)} className="text-xs text-ink-500">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setBoostingId(l.id)} className="text-xs text-brand-600 hover:underline">
                        ⭐ Boost this listing
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {boostError && <p className="text-sm text-red-600 mt-3">{boostError}</p>}

      <ConfirmModal
        open={!!deleteTarget}
        danger
        title="Delete this listing?"
        message={deleteTarget ? `"${deleteTarget.title}" will be removed permanently. This can't be undone.` : ""}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
