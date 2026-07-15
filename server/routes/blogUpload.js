const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect } = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

const router = express.Router();

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads", "blog");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `blog-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed."),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

// ---------------------------------------------------------------------------
// POST /api/blog/upload
// Upload a new image for a blog post (cover image or content image)
// ---------------------------------------------------------------------------
router.post("/upload", protect, adminOnly, (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "File is too large. Maximum size is 5 MB."
          : err.message;
      return res.status(400).json({ success: false, message });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload an image file." });
    }

    try {
      // Build the public URL path
      const imageUrl = `/uploads/blog/${req.file.filename}`;

      return res
        .status(200)
        .json({ success: true, data: { url: imageUrl } });
    } catch (error) {
      console.error("uploadBlogImage error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Server error." });
    }
  });
});

module.exports = router;
