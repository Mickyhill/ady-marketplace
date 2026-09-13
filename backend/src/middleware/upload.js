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
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
  },
});

function fileFilter(req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, png, webp, gif) are allowed"));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

module.exports = upload;
