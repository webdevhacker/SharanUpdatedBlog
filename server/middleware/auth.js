/**
 * Authentication middleware.
 * Verifies the Bearer JWT access token, attaches req.user, and checks bans.
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Session = require("../models/Session");

/**
 * protect — requires a valid Bearer access token.
 * On success: req.user = User document, req.token = raw token string.
 * On failure: returns 401 Unauthorized or 403 Forbidden.
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify the access token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message =
        err.name === "TokenExpiredError"
          ? "Access token expired. Please refresh."
          : "Invalid access token.";
      return res.status(401).json({ success: false, message });
    }

    // 3. Find the user (excluding password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    // 4. Check if the account is banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned. Please contact support.",
      });
    }

    // 5. Update lastActive on the session (best-effort, no await to keep it fast)
    if (decoded.sessionId) {
      Session.findByIdAndUpdate(decoded.sessionId, {
        lastActive: new Date(),
      }).catch(() => {}); // Silently ignore errors — non-critical
    }

    // 6. Attach user and raw token to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
    });
  }
};

module.exports = { protect };
