/**
 * Auth routes.
 * Mounts all authentication controller functions.
 * Rate-limiting applied to sensitive mutation endpoints.
 */

const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  register,
  verifyOtp,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  verify2fa,
} = require("../controllers/authController");

const { protect } = require("../middleware/auth");

const router = express.Router();

// ---------------------------------------------------------------------------
// Rate limiter for sensitive auth routes
// 10 requests per 15 minutes per IP
// ---------------------------------------------------------------------------
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many requests from this IP. Please try again after 15 minutes.",
  },
  skipSuccessfulRequests: false,
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Public routes (with rate limiting on sensitive ones)
router.post("/register", authLimiter, register);
router.post("/verify-otp", verifyOtp);
router.post("/login", authLimiter, login);
router.post("/verify-2fa", authLimiter, verify2fa);
router.post("/refresh", refresh);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

module.exports = router;