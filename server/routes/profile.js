/**
 * Profile routes.
 * All routes require authentication (protect middleware).
 * Avatar upload handled via multer (multipart/form-data).
 */

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { protect } = require("../middleware/auth");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Session = require("../models/Session");
const { sendPasswordResetEmail } = require("../utils/email");
const { getClientInfo } = require("../utils/geoip");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const bcrypt = require("bcryptjs");

const router = express.Router();

// All profile routes require authentication
router.use(protect);

// ---------------------------------------------------------------------------
// Multer configuration — avatar uploads
// ---------------------------------------------------------------------------
const uploadsDir = path.join(__dirname, "..", "uploads");

// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    // Unique filename: userId-timestamp.ext
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `avatar-${_req.user._id}-${Date.now()}${ext}`;
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
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
});

// ---------------------------------------------------------------------------
// GET /api/profile
// Returns the authenticated user's full profile.
// ---------------------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    return res.status(200).json({ success: true, data: req.user });
  } catch (error) {
    console.error("getProfile error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/profile
// Update profile fields (name, bio, website, social links).
// ---------------------------------------------------------------------------
router.put("/", async (req, res) => {
  try {
    const { name, bio, website, twitter, github, linkedin } = req.body;

    // Build update object from provided fields only
    const updates = {};
    if (name !== undefined) {
      if (!name.trim()) {
        return res
          .status(400)
          .json({ success: false, message: "Name cannot be empty." });
      }
      updates.name = name.trim();
    }
    if (bio !== undefined) updates.bio = bio;
    if (website !== undefined) updates.website = website;
    if (twitter !== undefined) updates.twitter = twitter;
    if (github !== undefined) updates.github = github;
    if (linkedin !== undefined) updates.linkedin = linkedin;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true, select: "-password" }
    );

    return res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("updateProfile error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(", ") });
    }
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/profile/password
// Change the authenticated user's password.
// ---------------------------------------------------------------------------
router.put("/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters.",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the current password.",
      });
    }

    // Fetch user with password field
    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect." });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    // Revoke all OTHER sessions (keep the current one so user stays logged in)
    const authHeader = req.headers.authorization;
    const currentToken = authHeader ? authHeader.split(" ")[1] : null;

    // We cannot easily find the current session here by access token,
    // so we delete all sessions for safety and let the client handle re-login.
    await Session.deleteMany({ userId: user._id });

    // Collect client info and send confirmation email
    const clientInfo = getClientInfo(req);
    const timestamp = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date()) + " IST";

    // Create notification
    await Notification.create({
      userId: user._id,
      type: "password_change",
      title: "Password Changed",
      message: "Your account password was successfully changed.",
      metadata: { ip: clientInfo.ip, location: clientInfo.location, timestamp },
    });

    // Send email (non-blocking)
    sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      clientInfo: { ...clientInfo, timestamp },
    }).catch(console.error);

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully. Please log in again with your new password.",
    });
  } catch (error) {
    console.error("changePassword error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ---------------------------------------------------------------------------
// POST /api/profile/avatar
// Upload a new avatar image. Replaces the old file on disk.
// ---------------------------------------------------------------------------
router.post("/avatar", (req, res) => {
  upload.single("avatar")(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "File is too large. Maximum size is 2 MB."
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
      const avatarUrl = `/uploads/${req.file.filename}`;

      // Remove the old avatar file if it exists and was stored locally
      const oldAvatar = req.user.avatar;
      if (oldAvatar && oldAvatar.startsWith("/uploads/")) {
        const oldPath = path.join(__dirname, "..", oldAvatar);
        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, (unlinkErr) => {
            if (unlinkErr) {
              console.warn("Could not delete old avatar:", unlinkErr.message);
            }
          });
        }
      }

      // Update the user record
      await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl });

      return res
        .status(200)
        .json({ success: true, data: { avatar: avatarUrl } });
    } catch (error) {
      console.error("uploadAvatar error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Server error." });
    }
  });
});

// ---------------------------------------------------------------------------
// 2FA Endpoints
// ---------------------------------------------------------------------------

// 1. Setup Authenticator App
router.post("/2fa/setup-app", async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `TechBlog (${req.user.email})`
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCodeUrl,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error setting up 2FA" });
  }
});

// 2. Verify and Enable Authenticator App
router.post("/2fa/verify-app", async (req, res) => {
  try {
    const { token, secret } = req.body;
    // Remove any spaces the user might have accidentally typed (e.g., "123 456")
    const cleanToken = String(token).replace(/\s+/g, "");

    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token: cleanToken,
      window: 2 // allow up to 1 minute of clock drift on VPS
    });

    if (!verified) {
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      twoFactorEnabled: true,
      twoFactorMethod: "app",
      twoFactorSecret: secret,
    });

    res.json({ success: true, message: "Authenticator App 2FA enabled successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error verifying 2FA" });
  }
});

// 3. Enable Email OTP 2FA
router.post("/2fa/enable-email", async (req, res) => {
  try {
    // The user's email is already verified at registration. We just enable it.
    await User.findByIdAndUpdate(req.user._id, {
      twoFactorEnabled: true,
      twoFactorMethod: "email",
      twoFactorSecret: "", // clear secret if switching from app
    });

    res.json({ success: true, message: "Email 2FA enabled successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error enabling Email 2FA" });
  }
});

// 4. Disable 2FA
router.delete("/2fa", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required to disable 2FA" });
    }

    // Verify password first
    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      twoFactorEnabled: false,
      twoFactorMethod: "none",
      twoFactorSecret: "",
    });

    res.json({ success: true, message: "2FA disabled successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error disabling 2FA" });
  }
});

module.exports = router;