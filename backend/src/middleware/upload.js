const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Files upload straight to Cloudinary instead of local disk. This matters:
// Render's free tier wipes the backend's local disk on every redeploy, which
// silently deleted every previously-uploaded listing photo, avatar, and
// student ID photo. Cloudinary storage survives redeploys, since the files
// never touch the server's own disk at all.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ady-marketplace",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "heic", "heif"],
  },
});

function fileFilter(req, file, cb) {
  // Checking the broad "image/*" prefix rather than an exact whitelist —
  // different phones/browsers report MIME types slightly differently
  // (e.g. "image/jpg" instead of "image/jpeg"), which caused real uploads
  // to get rejected here even though they were genuinely valid images.
  // Cloudinary's own allowed_formats list (above) is the actual gatekeeper
  // for which formats succeed — this filter just blocks non-image files.
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

module.exports = upload;