// In local dev, Vite's proxy (vite.config.js) forwards "/api" to
// http://localhost:4000 automatically. Once deployed, the frontend and
// backend live on different domains, so set VITE_API_BASE_URL (in a .env
// file, or as an env var in your hosting provider) to the backend's full
// URL, e.g. "https://aksmarketplace-api.onrender.com/api".
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// Uploaded images (listing photos, avatars) come back from the API as paths
// like "/uploads/abc123.png" — relative to the BACKEND, not the frontend.
// Locally this works by accident because Vite's dev proxy forwards /uploads
// to the backend too. In production, frontend and backend are on different
// domains, so relative paths would resolve against the frontend's own URL
// and 404. This resolves them against the backend's real origin instead.
const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");
export function resolveUploadUrl(path) {
  if (!path) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
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
  // auth
  register: (formData) => request("/auth/register", { method: "POST", body: formData, isMultipart: true }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: () => request("/auth/me"),
  forgotPassword: (email) => request("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (payload) => request("/auth/reset-password", { method: "POST", body: payload }),

  // users
  getUser: (id) => request(`/users/${id}`),
  updateProfile: (formData) => request("/users/me/update", { method: "PATCH", body: formData, isMultipart: true }),

  // categories
  getCategories: () => request("/categories"),

  // listings
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

  // messages
  getConversations: () => request("/messages/conversations"),
  getThread: (listingId, otherUserId) => request(`/messages/thread/${listingId}/${otherUserId}`),
  sendMessage: (payload) => request("/messages", { method: "POST", body: payload }),

  // reports
  fileReport: (payload) => request("/reports", { method: "POST", body: payload }),

  // reviews
  createReview: (payload) => request("/reviews", { method: "POST", body: payload }),
  getSellerReviews: (sellerId) => request(`/reviews/seller/${sellerId}`),

  // disputes
  openDispute: (payload) => request("/disputes", { method: "POST", body: payload }),
  getMyDisputes: () => request("/disputes/mine"),

  // admin
  getAdminStats: () => request("/admin/stats"),
  getAdminUsers: () => request("/admin/users"),
  verifyUser: (id, status) => request(`/admin/users/${id}/verify`, { method: "PATCH", body: { status } }),
  setPhoneVerified: (id, verified) => request(`/admin/users/${id}/phone`, { method: "PATCH", body: { verified } }),
  setIdentityVerified: (id, verified) => request(`/admin/users/${id}/identity`, { method: "PATCH", body: { verified } }),
  getAdminListings: () => request("/admin/listings"),
  setListingStatus: (id, status) => request(`/admin/listings/${id}/status`, { method: "PATCH", body: { status } }),
  setListingFeatured: (id, featured) => request(`/admin/listings/${id}/feature`, { method: "PATCH", body: { featured } }),
  setItemInspected: (id, inspected) => request(`/admin/listings/${id}/inspect`, { method: "PATCH", body: { inspected } }),
  getAdminReports: () => request("/admin/reports"),
  resolveReport: (id) => request(`/admin/reports/${id}/resolve`, { method: "PATCH" }),
  getAdminDisputes: () => request("/admin/disputes"),
  resolveDispute: (id, status) => request(`/admin/disputes/${id}/resolve`, { method: "PATCH", body: { status } }),
};

export function setToken(token) {
  localStorage.setItem("aksmp_token", token);
}
export function clearToken() {
  localStorage.removeItem("aksmp_token");
}
