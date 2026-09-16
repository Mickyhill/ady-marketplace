require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/users.routes");
const categoryRoutes = require("./routes/categories.routes");
const listingRoutes = require("./routes/listings.routes");
const messageRoutes = require("./routes/messages.routes");
const reportRoutes = require("./routes/reports.routes");
const reviewRoutes = require("./routes/reviews.routes");
const disputeRoutes = require("./routes/disputes.routes");
const adminRoutes = require("./routes/admin.routes");
const otpRoutes = require("./routes/otp.routes");
const deviceRoutes = require("./routes/deviceFingerprint.routes");
const transactionRoutes = require("./routes/transactions.routes");
const boostRoutes = require("./routes/boosts.routes");
const webhookRoutes = require("./routes/webhooks.routes");
const newsletterRoutes = require("./routes/newsletter.routes");

const app = express();

// Allow both the real custom domain AND the old .onrender.com address —
// keeps anything already bookmarked/shared with the old link working
// during the transition, rather than suddenly breaking it.
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "https://aksmarketplace-2.onrender.com",
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
}));

// IMPORTANT: mount the Paystack webhook route BEFORE express.json(). Paystack
// signs the exact raw request bytes, and once express.json() has parsed the
// body there's no way to get those original bytes back — signature
// verification would silently and permanently fail. See webhooks.routes.js
// for the express.raw() call that actually reads the raw body.
app.use("/api/webhooks", webhookRoutes);

app.use(express.json());
app.use(morgan("dev"));

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/auth/phone", otpRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/device", deviceRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/boosts", boostRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/admin", adminRoutes);

// Central error handler (multer errors, etc.)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Something went wrong" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`ADY Marketplace API running on http://localhost:${PORT}`);
});