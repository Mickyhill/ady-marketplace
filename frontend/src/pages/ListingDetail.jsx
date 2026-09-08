import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import { resolveUploadUrl } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatNaira, CONDITION_LABEL } from "../components/ListingCard";

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [error, setError] = useState("");
  const [messageText, setMessageText] = useState("");
  const [messageStatus, setMessageStatus] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportStatus, setReportStatus] = useState("");

  useEffect(() => {
    api.getListing(id).then((d) => setListing(d.listing)).catch((e) => setError(e.message));
  }, [id]);

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!user) return navigate("/login", { state: { from: `/listing/${id}` } });
    setMessageStatus("");
    try {
      await api.sendMessage({ listingId: id, content: messageText });
      setMessageText("");
      setMessageStatus("Message sent! Check Messages to continue the conversation.");
    } catch (err) {
      setMessageStatus(err.message);
    }
  }

  async function handleReport(e) {
    e.preventDefault();
    if (!user) return navigate("/login", { state: { from: `/listing/${id}` } });
    try {
      await api.fileReport({ listingId: id, reason: reportReason });
      setReportStatus("Report submitted. Our team will review this listing.");
      setShowReport(false);
    } catch (err) {
      setReportStatus(err.message);
    }
  }

  if (error) return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-sm text-red-600">{error}</div>;
  if (!listing) return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-sm text-ink-500">Loading...</div>;

  const isOwner = user?.id === listing.seller.id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
      <div>
        <div className="aspect-[4/3] rounded-lg overflow-hidden bg-ink-100 mb-3">
          {listing.images[activeImage] ? (
            <img src={resolveUploadUrl(listing.images[activeImage].url)} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-300">No photo</div>
          )}
        </div>
        {listing.images.length > 1 && (
          <div className="flex gap-2">
            {listing.images.map((img, i) => (
              <button key={img.id} onClick={() => setActiveImage(i)} className={`w-14 h-14 rounded-md overflow-hidden border-2 ${i === activeImage ? "border-brand-500" : "border-transparent"}`}>
                <img src={resolveUploadUrl(img.url)} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        {listing.status !== "ACTIVE" && (
          <span className="inline-block mb-2 text-xs px-2 py-1 rounded-full bg-ink-100 text-ink-500 font-medium">{listing.status.replace("_", " ")}</span>
        )}
        <h1 className="text-2xl font-semibold">{listing.title}</h1>
        <p className="text-2xl text-brand-600 font-semibold mt-2">{formatNaira(listing.price)}</p>
        <p className="text-sm text-ink-500 mt-1">{CONDITION_LABEL[listing.condition]} · {listing.location} · {listing.category?.name}</p>

        <p className="mt-4 text-sm whitespace-pre-line">{listing.description}</p>

        <div className="mt-6 border-t border-ink-300/40 pt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-ink-100 overflow-hidden shrink-0">
            {listing.seller.avatarUrl && <img src={resolveUploadUrl(listing.seller.avatarUrl)} className="w-full h-full object-cover" />}
          </div>
          <div>
            <Link to={`/profile?user=${listing.seller.id}`} className="text-sm font-medium hover:underline">{listing.seller.name}</Link>
            <p className="text-xs text-ink-500">
              {listing.seller.verificationStatus === "VERIFIED" ? "✓ Verified student" : "Unverified"}
              {listing.seller.ratingCount > 0 && ` · ${listing.seller.rating.toFixed(1)}★ (${listing.seller.ratingCount})`}
            </p>
          </div>
        </div>

        {!isOwner && (
          <form onSubmit={handleSendMessage} className="mt-4 space-y-2">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Ask ${listing.seller.name.split(" ")[0]} about this item...`}
              rows={2}
              required
              className="w-full border border-ink-300/50 rounded-md px-3 py-2 text-sm"
            />
            <button className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-md py-2.5 text-sm font-medium">
              Message seller
            </button>
            {messageStatus && <p className="text-sm text-ink-500">{messageStatus}</p>}
          </form>
        )}

        {!isOwner && (
          <div className="mt-4">
            {!showReport ? (
              <button onClick={() => setShowReport(true)} className="text-xs text-ink-500 hover:underline">Report this listing</button>
            ) : (
              <form onSubmit={handleReport} className="text-sm space-y-2 border border-ink-300/40 rounded-md p-3">
                <select required value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="w-full border border-ink-300/50 rounded-md px-2 py-1.5 text-sm">
                  <option value="">Select a reason...</option>
                  <option value="Suspicious or scam">Suspicious or scam</option>
                  <option value="Prohibited item">Prohibited item</option>
                  <option value="Misleading description">Misleading description</option>
                  <option value="Other">Other</option>
                </select>
                <div className="flex gap-2">
                  <button className="text-xs bg-red-600 text-white rounded-md px-3 py-1.5">Submit report</button>
                  <button type="button" onClick={() => setShowReport(false)} className="text-xs border border-ink-300 rounded-md px-3 py-1.5">Cancel</button>
                </div>
              </form>
            )}
            {reportStatus && <p className="text-xs text-ink-500 mt-2">{reportStatus}</p>}
          </div>
        )}

        {isOwner && (
          <Link to="/my-listings" className="mt-6 inline-block text-sm text-brand-600 underline">Manage this listing</Link>
        )}
      </div>
    </div>
  );
}
