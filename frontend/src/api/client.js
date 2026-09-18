const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");
export function resolveUploadUrl(path) {
  if (!path) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    // Cloudinary URLs: inject f_auto,q_auto so every image is served in the
    // best format for the visitor's browser (WebP/AVIF where supported) at
    // an automatically-tuned quality — real savings with zero manual
    // per-photo compression work.
    if (path.includes("res.cloudinary.com") && path.includes("/upload/") && !path.includes("f_auto")) {
      return path.replace("/upload/", "/upload/f_auto,q_auto/");
    }
    return path;
  }
  return `${API_ORIGIN}${path}`;
}

function getToken() {
  return localStorage.getItem("aksmp_token");
}

async function request(path, { method = "GET", body, isMultipart = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isMultipart && body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isMultipart ? body : body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    throw new Error((data && data.error) || "Something went wrong. Please try again.");
  }
  return data;
}

export const api = {
  register: (formData) => request("/auth/register", { method: "POST", body: formData, isMultipart: true }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: () => request("/auth/me"),
  forgotPassword: (email) => request("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (payload) => request("/auth/reset-password", { method: "POST", body: payload }),

  getUser: (id) => request(`/users/${id}`),
  updateProfile: (formData) => request("/users/me/update", { method: "PATCH", body: formData, isMultipart: true }),
  deleteAccount: () => request("/users/me", { method: "DELETE" }),
  getPayoutStatus: () => request("/users/me/payout"),
  getBanks: () => request("/users/me/banks"),
  setupPayout: (payload) => request("/users/me/payout", { method: "POST", body: payload }),

  getCategories: () => request("/categories"),

  getListings: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))).toString();
    return request(`/listings${qs ? `?${qs}` : ""}`);
  },
  getListing: (id) => request(`/listings/${id}`),
  createListing: (formData) => request("/listings", { method: "POST", body: formData, isMultipart: true }),
  getMyListings: () => request("/listings/mine/all"),
  updateListing: (id, payload) => request(`/listings/${id}`, { method: "PATCH", body: payload }),
  markSold: (id) => request(`/listings/${id}/sold`, { method: "PATCH" }),
  deleteListing: (id) => request(`/listings/${id}`, { method: "DELETE" }),

  getConversations: () => request("/messages/conversations"),
  getThread: (listingId, otherUserId) => request(`/messages/thread/${listingId}/${otherUserId}`),
  sendMessage: (payload) => request("/messages", { method: "POST", body: payload }),

  fileReport: (payload) => request("/reports", { method: "POST", body: payload }),

  createReview: (payload) => request("/reviews", { method: "POST", body: payload }),
  getSellerReviews: (sellerId) => request(`/reviews/seller/${sellerId}`),

  openDispute: (payload) => request("/disputes", { method: "POST", body: payload }),
  getMyDisputes: () => request("/disputes/mine"),

  getAdminStats: () => request("/admin/stats"),
  getAdminUsers: () => request("/admin/users"),
  verifyUser: (id, status) => request(`/admin/users/${id}/verify`, { method: "PATCH", body: { status } }),
  setPhoneVerified: (id, verified) => request(`/admin/users/${id}/phone`, { method: "PATCH", body: { verified } }),
  setIdentityVerified: (id, verified) => request(`/admin/users/${id}/identity`, { method: "PATCH", body: { verified } }),
  setUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: "PATCH", body: { role } }),
  getAdminListings: () => request("/admin/listings"),
  setListingStatus: (id, status) => request(`/admin/listings/${id}/status`, { method: "PATCH", body: { status } }),
  setListingFeatured: (id, featured) => request(`/admin/listings/${id}/feature`, { method: "PATCH", body: { featured } }),
  setItemInspected: (id, inspected) => request(`/admin/listings/${id}/inspect`, { method: "PATCH", body: { inspected } }),
  getAdminReports: () => request("/admin/reports"),
  resolveReport: (id) => request(`/admin/reports/${id}/resolve`, { method: "PATCH" }),
  getAdminDisputes: () => request("/admin/disputes"),
  resolveDispute: (id, status) => request(`/admin/disputes/${id}/resolve`, { method: "PATCH", body: { status } }),
  releaseDisputeFunds: (id) => request(`/admin/disputes/${id}/release-funds`, { method: "PATCH" }),
  refundDisputeBuyer: (id) => request(`/admin/disputes/${id}/refund-buyer`, { method: "PATCH" }),
  getAdminRiskFlags: () => request("/admin/risk-flags"),
  resolveRiskFlag: (id) => request(`/admin/risk-flags/${id}/resolve`, { method: "PATCH" }),

  sendPhoneOtp: (phone) => request("/auth/phone/send-otp", { method: "POST", body: { phone } }),
  verifyPhoneOtp: (code) => request("/auth/phone/verify-otp", { method: "POST", body: { code } }),

  registerDevice: (fingerprint) => request("/device/register", { method: "POST", body: { fingerprint } }),

  createTransaction: (listingId) => request("/transactions", { method: "POST", body: { listingId } }),
  getTransaction: (id) => request(`/transactions/${id}`),
  getMyTransactionForListing: (listingId) => request(`/transactions/mine/${listingId}`),
  confirmTransactionReceived: (id) => request(`/transactions/${id}/confirm-received`, { method: "POST" }),
  disputeTransaction: (id, reason, details) => request(`/transactions/${id}/dispute`, { method: "POST", body: { reason, details } }),

  createBoost: (listingId, durationDays) => request("/boosts", { method: "POST", body: { listingId, durationDays } }),

  subscribeNewsletter: (email) => request("/newsletter/subscribe", { method: "POST", body: { email } }),
};

export function setToken(token) {
  localStorage.setItem("aksmp_token", token);
}
export function clearToken() {
  localStorage.removeItem("aksmp_token");
}
