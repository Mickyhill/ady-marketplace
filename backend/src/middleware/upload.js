const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// NOTE: This stores files on local disk under /uploads, which works fine for
// development and small deployments. For production at scale, swap this out
// for an object-storage provider (Cloudinary, S3, etc.) — the routes only
// care that req.files[i].filename / req.file.filename exists, so swapping
// the storage engine here is a self-contained change.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
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
