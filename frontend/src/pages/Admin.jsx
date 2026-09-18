import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { formatNaira } from "../components/ListingCard";
import { resolveUploadUrl } from "../api/client";
import { useAuth } from "../context/AuthContext";

const TABS = ["Overview", "Users", "Listings", "Reports", "Disputes", "Risk Flags"];

const RISK_STYLE = {
  LOW: "bg-green-100 text-green-700",
  NORMAL: "bg-ink-100 text-ink-500",
  REVIEW: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-red-100 text-red-700",
};
const RISK_EMOJI = { LOW: "🟢", NORMAL: "⚪", REVIEW: "🟡", HIGH: "🔴" };

export default function Admin() {
  const { user: me } = useAuth();
  const [tab, setTab] = useState("Overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [reports, setReports] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [riskFlags, setRiskFlags] = useState([]);
  const [actionStatus, setActionStatus] = useState("");

  function loadAll() {
    api.getAdminStats().then(setStats).catch(() => {});
    api.getAdminUsers().then((d) => setUsers(d.users)).catch(() => {});
    api.getAdminListings().then((d) => setListings(d.listings)).catch(() => {});
    api.getAdminReports().then((d) => setReports(d.reports)).catch(() => {});
    api.getAdminDisputes().then((d) => setDisputes(d.disputes)).catch(() => {});
    api.getAdminRiskFlags().then((d) => setRiskFlags(d.flags)).catch(() => {});
  }

  useEffect(loadAll, []);

  async function handleVerify(id, status) {
    await api.verifyUser(id, status);
    loadAll();
  }

  async function handlePhoneToggle(id, current) {
    await api.setPhoneVerified(id, !current);
    loadAll();
  }

  async function handleIdentityToggle(id, current) {
    await api.setIdentityVerified(id, !current);
    loadAll();
  }

  async function handleRoleToggle(id, currentRole) {
    setActionStatus("");
    try {
      await api.setUserRole(id, currentRole === "ADMIN" ? "STUDENT" : "ADMIN");
      loadAll();
    } catch (err) {
      setActionStatus(err.message);
    }
  }

  async function handleListingStatus(id, status) {
    await api.setListingStatus(id, status);
    loadAll();
  }

  async function handleFeature(id, featured) {
    await api.setListingFeatured(id, featured);
    loadAll();
  }

  async function handleInspect(id, current) {
    await api.setItemInspected(id, !current);
    loadAll();
  }

  async function handleResolve(id) {
    await api.resolveReport(id);
    loadAll();
  }

  async function handleDisputeResolve(id, status) {
    await api.resolveDispute(id, status);
    loadAll();
  }

  async function handleReleaseFunds(id) {
    setActionStatus("");
    try {
      await api.releaseDisputeFunds(id);
      setActionStatus("Funds released to seller.");
      loadAll();
    } catch (err) {
      setActionStatus(err.message);
    }
  }

  async function handleRefundBuyer(id) {
    setActionStatus("");
    try {
      await api.refundDisputeBuyer(id);
      setActionStatus("Funds refunded to buyer.");
      loadAll();
    } catch (err) {
      setActionStatus(err.message);
    }
  }

  async function handleFlagResolve(id) {
    await api.resolveRiskFlag(id);
    loadAll();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Admin dashboard</h1>
      {actionStatus && <p className="text-sm text-red-600 mb-4">{actionStatus}</p>}

      <div className="flex gap-1 mb-6 border-b border-ink-300/40 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${tab === t ? "border-brand-500 text-brand-600" : "border-transparent text-ink-500"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            ["Total users", stats.users],
            ["Verified users", stats.verifiedUsers],
            ["Active listings", stats.activeListings],
            ["Sold listings", stats.soldListings],
            ["Unresolved reports", stats.unresolvedReports],
            ["Open disputes", stats.openDisputes],
          ].map(([label, value]) => (
            <div key={label} className="border border-ink-300/40 rounded-lg p-4 bg-white">
              <p className="text-2xl font-semibold">{value}</p>
              <p className="text-xs text-ink-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "Users" && (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="border border-ink-300/40 rounded-lg p-3 bg-white text-sm">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {u.name} <span className="text-ink-500 font-normal">· {u.email}</span>
                    {u.role === "ADMIN" && <span className="ml-2 text-xs bg-ink-900 text-white px-2 py-0.5 rounded-full">Admin</span>}
                  </p>
                  <p className="text-xs text-ink-500">{u.department} {u.faculty && `· ${u.faculty}`} {u.matricNumber && `· ${u.matricNumber}`}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${RISK_STYLE[u.risk]}`}>{RISK_EMOJI[u.risk]} {u.risk}</span>
              </div>
              {u.studentPortalScreenshotUrl && (
                <a href={resolveUploadUrl(u.studentPortalScreenshotUrl)} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline block mt-1">
                  View student portal screenshot
                </a>
              )}
              {u.verifiedBy && (
                <p className="text-xs text-ink-500 mt-1">
                  Verified by {u.verifiedBy.name} ({u.verifiedBy.email}) on {new Date(u.verifiedAt).toLocaleDateString()}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs px-2 py-1 rounded-full bg-ink-100">AKSU: {u.verificationStatus}</span>
                {u.verificationStatus !== "VERIFIED" && (
                  <button onClick={() => handleVerify(u.id, "VERIFIED")} className="text-xs bg-green-600 text-white rounded-md px-3 py-1.5">Verify AKSU</button>
                )}
                {u.verificationStatus === "PENDING" && (
                  <button onClick={() => handleVerify(u.id, "REJECTED")} className="text-xs border border-red-200 text-red-600 rounded-md px-3 py-1.5">Reject</button>
                )}
                <button onClick={() => handlePhoneToggle(u.id, u.phoneVerified)} className="text-xs border border-ink-300 rounded-md px-3 py-1.5">
                  {u.phoneVerified ? "Unverify phone" : "Verify phone"}
                </button>
                <button onClick={() => handleIdentityToggle(u.id, u.identityVerified)} className="text-xs border border-ink-300 rounded-md px-3 py-1.5">
                  {u.identityVerified ? "Unverify identity" : "Verify identity"}
                </button>
                {u.id !== me?.id && (
                  <button onClick={() => handleRoleToggle(u.id, u.role)} className="text-xs border border-ink-900 rounded-md px-3 py-1.5">
                    {u.role === "ADMIN" ? "Remove admin access" : "Make admin"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "Listings" && (
        <div className="space-y-2">
          {listings.map((l) => (
            <div key={l.id} className="flex items-center gap-3 border border-ink-300/40 rounded-lg p-3 bg-white text-sm">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{l.title} <span className="text-brand-600">· {formatNaira(l.price)}</span></p>
                <p className="text-xs text-ink-500">Seller: {l.seller.name} ({l.seller.email})</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-ink-100">{l.status.replace("_", " ")}</span>
              <button onClick={() => handleInspect(l.id, l.itemVerified)} className="text-xs border border-ink-300 rounded-md px-3 py-1.5">
                {l.itemVerified ? "Unmark inspected" : "Mark inspected"}
              </button>
              <button onClick={() => handleFeature(l.id, !l.featured)} className="text-xs border border-ink-300 rounded-md px-3 py-1.5">
                {l.featured ? "Unfeature" : "Feature"}
              </button>
              {l.status !== "REMOVED" ? (
                <button onClick={() => handleListingStatus(l.id, "REMOVED")} className="text-xs border border-red-200 text-red-600 rounded-md px-3 py-1.5">Remove</button>
              ) : (
                <button onClick={() => handleListingStatus(l.id, "ACTIVE")} className="text-xs border border-green-200 text-green-700 rounded-md px-3 py-1.5">Restore</button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "Reports" && (
        <div className="space-y-2">
          {reports.length === 0 && <p className="text-sm text-ink-500">No reports filed.</p>}
          {reports.map((r) => (
            <div key={r.id} className="flex items-center gap-3 border border-ink-300/40 rounded-lg p-3 bg-white text-sm">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{r.listing.title}</p>
                <p className="text-xs text-ink-500">Reason: {r.reason} · Reported by {r.reporter.name}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${r.resolved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {r.resolved ? "Resolved" : "Open"}
              </span>
              {!r.resolved && (
                <button onClick={() => handleResolve(r.id)} className="text-xs bg-brand-500 text-white rounded-md px-3 py-1.5">Mark resolved</button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "Disputes" && (
        <div className="space-y-3">
          {disputes.length === 0 && <p className="text-sm text-ink-500">No disputes filed.</p>}
          {disputes.map((d) => (
            <div key={d.id} className="border border-ink-300/40 rounded-lg p-3 bg-white text-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{d.listing.title}</p>
                  <p className="text-xs text-ink-500">{d.reason} · Buyer: {d.buyer.name} · Seller: {d.seller.name}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  d.status === "OPEN" ? "bg-yellow-100 text-yellow-700" : d.status === "RESOLVED" ? "bg-green-100 text-green-700" : "bg-ink-100 text-ink-500"
                }`}>
                  {d.status}
                </span>
              </div>
              {d.details && <p className="text-xs mb-2">{d.details}</p>}
              {d.transaction && (
                <p className="text-xs mb-2 font-medium">
                  Linked payment: ₦{(d.transaction.totalAmount / 100).toLocaleString("en-NG")} — status: {d.transaction.status}
                </p>
              )}
              {d.messages.length > 0 && (
                <div className="bg-ink-100 rounded-md p-2 mb-2 max-h-32 overflow-y-auto space-y-1">
                  {d.messages.map((m) => (
                    <p key={m.id} className="text-xs">
                      <span className="font-medium">{m.senderId === d.buyerId ? "Buyer" : "Seller"}:</span> {m.content}
                    </p>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {d.status === "OPEN" && (
                  <>
                    <button onClick={() => handleDisputeResolve(d.id, "RESOLVED")} className="text-xs bg-green-600 text-white rounded-md px-3 py-1.5">Mark resolved</button>
                    <button onClick={() => handleDisputeResolve(d.id, "REJECTED")} className="text-xs border border-red-200 text-red-600 rounded-md px-3 py-1.5">Reject</button>
                  </>
                )}
                {d.transaction && d.transaction.status === "DISPUTED" && (
                  <>
                    <button onClick={() => handleReleaseFunds(d.id)} className="text-xs bg-brand-500 text-white rounded-md px-3 py-1.5">
                      Rule for seller — release funds
                    </button>
                    <button onClick={() => handleRefundBuyer(d.id)} className="text-xs bg-ink-900 text-white rounded-md px-3 py-1.5">
                      Rule for buyer — refund
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "Risk Flags" && (
        <div className="space-y-2">
          <p className="text-xs text-ink-500 mb-2">Automated fraud signals — shared devices across accounts, and photos matching another listing.</p>
          {riskFlags.length === 0 && <p className="text-sm text-ink-500">No risk flags.</p>}
          {riskFlags.map((f) => (
            <div key={f.id} className="flex items-center gap-3 border border-ink-300/40 rounded-lg p-3 bg-white text-sm">
              <div className="flex-1 min-w-0">
                <p className="font-medium">{f.type.replace(/_/g, " ")}</p>
                <p className="text-xs text-ink-500">{f.details}</p>
                {f.user && <p className="text-xs text-ink-500">User: {f.user.name} ({f.user.email})</p>}
                {f.listing && <p className="text-xs text-ink-500">Listing: {f.listing.title}</p>}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${f.severity === "RED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                {f.severity === "RED" ? "🔴" : "🟡"} {f.severity}
              </span>
              {!f.resolved && (
                <button onClick={() => handleFlagResolve(f.id)} className="text-xs border border-ink-300 rounded-md px-3 py-1.5">Mark reviewed</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}