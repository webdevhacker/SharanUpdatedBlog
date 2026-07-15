/**
 * Auth controller.
 * Handles registration, OTP verification, login, token refresh,
 * logout, forgot-password, reset-password, and getMe.
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const OTP = require("../models/OTP");
const Session = require("../models/Session");
const Notification = require("../models/Notification");
const { getClientInfo } = require("../utils/geoip");
const {
  sendOTPVerifyEmail,
  sendForgotPasswordEmail,
  sendLoginAlertEmail,
  sendPasswordResetEmail,
} = require("../utils/email");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a cryptographically simple 6-digit OTP string. */
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Format a Date for human-readable email display in IST.
 *
 * @param {Date} [date]
 * @returns {string} e.g. "Monday, July 14, 2026 at 10:55 AM IST"
 */
const formatTimestamp = (date = new Date()) => {
  const formatted = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  return `${formatted} IST`;
};

/**
 * Sign a JWT access token.
 *
 * @param {string} id         User._id
 * @param {string} sessionId  Session._id (embedded so middleware can update lastActive)
 * @returns {string}
 */
const signAccessToken = (id, sessionId) =>
  jwt.sign({ id, sessionId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });

/**
 * Sign a JWT refresh token.
 *
 * @param {string} id
 * @returns {string}
 */
const signRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });

// ---------------------------------------------------------------------------
// register
// ---------------------------------------------------------------------------

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 *
 * - Validates input
 * - Checks email uniqueness
 * - Creates user (first user in DB becomes admin)
 * - Generates & stores OTP (purpose: verify)
 * - Sends OTP verification email
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    // Email uniqueness
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // First user in the DB becomes the admin
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? "admin" : "user";

    // Create the user (password will be hashed by the pre-save hook)
    const user = await User.create({ name, email, password, role });

    // Generate & persist OTP
    const otp = generateOTP();
    await OTP.deleteMany({ email: user.email, purpose: "verify" }); // Remove old OTPs
    await OTP.create({ email: user.email, otp, purpose: "verify" });

    // Fire-and-forget: send verification email
    sendOTPVerifyEmail({ to: user.email, name: user.name, otp }).catch(
      console.error
    );

    return res.status(201).json({
      success: true,
      message: "Account created! Please check your email for the verification OTP.",
    });
  } catch (error) {
    console.error("register error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ---------------------------------------------------------------------------
// verifyOtp
// ---------------------------------------------------------------------------

/**
 * POST /api/auth/verify-otp
 * Body: { email, otp }
 *
 * - Validates OTP existence and expiry
 * - Marks user as verified
 * - Creates account_verified notification
 */
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required." });
    }

    // Find the matching OTP record
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      purpose: "verify",
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or already used. Please request a new one.",
      });
    }

    // Check expiry
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new verification email.",
      });
    }

    // Check OTP value
    if (otpRecord.otp !== otp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP. Please try again." });
    }

    // Mark user as verified
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Delete OTP after successful use
    await OTP.deleteOne({ _id: otpRecord._id });

    // Create notification
    await Notification.create({
      userId: user._id,
      type: "account_verified",
      title: "Account Verified",
      message: "Your email address has been successfully verified.",
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    console.error("verifyOtp error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ---------------------------------------------------------------------------
// login
// ---------------------------------------------------------------------------

/**
 * POST /api/auth/login
 * Body: { email, password }
 *
 * - Validates credentials
 * - Checks ban + verification status
 * - Creates Session with geo/UA info
 * - Issues accessToken + refreshToken
 * - Sends login alert email (non-blocking)
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
    }

    // Find user and explicitly select password
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    // Check ban
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned. Please contact support.",
      });
    }

    // Check email verification
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email before logging in. Check your inbox for the OTP.",
      });
    }

    // Collect client info
    const clientInfo = getClientInfo(req);
    const timestamp = formatTimestamp();

    // Generate tokens
    const refreshToken = signRefreshToken(user._id.toString());

    // Persist session first (need _id to embed in access token)
    const session = await Session.create({
      userId: user._id,
      refreshToken,
      ip: clientInfo.ip,
      city: clientInfo.city,
      country: clientInfo.country,
      browser: clientInfo.browser,
      os: clientInfo.os,
      device: clientInfo.device,
    });

    const accessToken = signAccessToken(
      user._id.toString(),
      session._id.toString()
    );

    // Create login notification
    await Notification.create({
      userId: user._id,
      type: "login",
      title: "New Sign-in",
      message: `New sign-in from ${clientInfo.browser} on ${clientInfo.os} (${clientInfo.location}).`,
      metadata: {
        ip: clientInfo.ip,
        location: clientInfo.location,
        browser: clientInfo.browser,
        os: clientInfo.os,
        device: clientInfo.device,
        timestamp,
      },
    });

    // Send login alert email (non-blocking)
    sendLoginAlertEmail({
      to: user.email,
      name: user.name,
      clientInfo: { ...clientInfo, timestamp },
    }).catch(console.error);

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ---------------------------------------------------------------------------
// refresh
// ---------------------------------------------------------------------------

/**
 * POST /api/auth/refresh
 * Body: { refreshToken }
 *
 * - Finds session by refreshToken
 * - Verifies JWT signature
 * - Issues a new access token
 */
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res
        .status(400)
        .json({ success: false, message: "Refresh token is required." });
    }

    // Find the session
    const session = await Session.findOne({ refreshToken });
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session not found or already revoked.",
      });
    }

    // Verify the refresh token signature
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      // Token tampered or expired — clean up the orphan session
      await Session.deleteOne({ _id: session._id });
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token. Please log in again.",
      });
    }

    // Issue new access token
    const accessToken = signAccessToken(
      decoded.id,
      session._id.toString()
    );

    // Update session lastActive
    session.lastActive = new Date();
    await session.save();

    return res.status(200).json({ success: true, accessToken });
  } catch (error) {
    console.error("refresh error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ---------------------------------------------------------------------------
// logout
// ---------------------------------------------------------------------------

/**
 * POST /api/auth/logout  (requires auth)
 * Body: { refreshToken }
 *
 * - Deletes the session matching the provided refresh token
 */
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res
        .status(400)
        .json({ success: false, message: "Refresh token is required." });
    }

    // Only delete if the session belongs to the authenticated user
    await Session.deleteOne({ refreshToken, userId: req.user._id });

    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    console.error("logout error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ---------------------------------------------------------------------------
// forgotPassword
// ---------------------------------------------------------------------------

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 *
 * - Looks up user (always returns success to prevent email enumeration)
 * - Generates & persists OTP (purpose: reset)
 * - Sends forgot-password email
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Return success even if user not found — security best practice
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a reset OTP has been sent.",
      });
    }

    // Collect client info for the email
    const clientInfo = getClientInfo(req);

    // Generate OTP and replace any existing reset OTP
    const otp = generateOTP();
    await OTP.deleteMany({ email: user.email, purpose: "reset" });
    await OTP.create({ email: user.email, otp, purpose: "reset" });

    // Create notification
    await Notification.create({
      userId: user._id,
      type: "otp_sent",
      title: "Password Reset Requested",
      message: `A password reset OTP was sent to ${user.email}.`,
      metadata: { ip: clientInfo.ip, location: clientInfo.location },
    });

    // Send email (non-blocking)
    sendForgotPasswordEmail({
      to: user.email,
      name: user.name,
      otp,
      clientInfo,
    }).catch(console.error);

    return res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, a reset OTP has been sent.",
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ---------------------------------------------------------------------------
// resetPassword
// ---------------------------------------------------------------------------

/**
 * POST /api/auth/reset-password
 * Body: { email, otp, newPassword }
 *
 * - Validates OTP (purpose: reset)
 * - Updates password (hashed via pre-save hook)
 * - Deletes ALL sessions (forces re-login)
 * - Sends password-reset confirmation email
 */
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters.",
      });
    }

    // Find reset OTP
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      purpose: "reset",
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or already used. Please request a new one.",
      });
    }

    // Check expiry
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new password reset.",
      });
    }

    // Check OTP value
    if (otpRecord.otp !== otp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP. Please try again." });
    }

    // Update the user's password
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    user.password = newPassword; // pre-save hook will hash this
    await user.save();

    // Delete the used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Revoke all existing sessions — force re-login on all devices
    await Session.deleteMany({ userId: user._id });

    // Collect client info for the notification email
    const clientInfo = getClientInfo(req);
    const timestamp = formatTimestamp();

    // Create password_change notification
    await Notification.create({
      userId: user._id,
      type: "password_change",
      title: "Password Changed",
      message: "Your account password was successfully reset.",
      metadata: {
        ip: clientInfo.ip,
        location: clientInfo.location,
        timestamp,
      },
    });

    // Send confirmation email (non-blocking)
    sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      clientInfo: { ...clientInfo, timestamp },
    }).catch(console.error);

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully! You have been signed out of all devices.",
    });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ---------------------------------------------------------------------------
// getMe
// ---------------------------------------------------------------------------

/**
 * GET /api/auth/me  (requires auth)
 *
 * Returns the authenticated user's profile (req.user set by protect middleware).
 */
const getMe = async (req, res) => {
  try {
    return res.status(200).json({ success: true, data: req.user });
  } catch (error) {
    console.error("getMe error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  register,
  verifyOtp,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
};