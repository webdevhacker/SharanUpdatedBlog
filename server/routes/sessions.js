/**
 * Sessions routes.
 * All routes require authentication.
 * Allows users to view and revoke their active sessions.
 */

const express = require("express");
const Session = require("../models/Session");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

// ---------------------------------------------------------------------------
// GET /api/sessions
// Returns all active sessions for the authenticated user.
// Marks the current session (identified by matching the Bearer token with
// the session's refreshToken is not directly possible here — instead we use
// the sessionId embedded in the access token's payload).
// ---------------------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id })
      .sort({ lastActive: -1 })
      .lean();

    // Decode the current access token to find the current session ID
    const jwt = require("jsonwebtoken");
    let currentSessionId = null;
    try {
      const decoded = jwt.decode(req.token);
      currentSessionId = decoded?.sessionId || null;
    } catch (_) {}

    // Annotate the current session
    const annotated = sessions.map((s) => ({
      ...s,
      isCurrent: currentSessionId
        ? s._id.toString() === currentSessionId
        : false,
    }));

    return res.status(200).json({ success: true, data: annotated });
  } catch (error) {
    console.error("getSessions error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/sessions/:id
// Revoke a single session by its MongoDB _id.
// Users can only revoke their own sessions.
// ---------------------------------------------------------------------------
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Session.findOneAndDelete({
      _id: id,
      userId: req.user._id, // Scope to authenticated user for security
    });

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found." });
    }

    return res
      .status(200)
      .json({ success: true, message: "Session revoked successfully." });
  } catch (error) {
    console.error("revokeSession error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/sessions
// Revoke ALL sessions for the authenticated user EXCEPT the current one.
// ---------------------------------------------------------------------------
router.delete("/", async (req, res) => {
  try {
    // Find the current session ID from the access token
    const jwt = require("jsonwebtoken");
    let currentSessionId = null;
    try {
      const decoded = jwt.decode(req.token);
      currentSessionId = decoded?.sessionId || null;
    } catch (_) {}

    const filter = { userId: req.user._id };
    if (currentSessionId) {
      filter._id = { $ne: currentSessionId }; // Exclude current session
    }

    const result = await Session.deleteMany(filter);

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} session(s) revoked.`,
    });
  } catch (error) {
    console.error("revokeAllSessions error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;