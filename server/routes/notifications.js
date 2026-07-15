/**
 * Notification routes.
 * All routes require authentication.
 */

const express = require("express");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

// ---------------------------------------------------------------------------
// GET /api/notifications
// Returns all notifications for the authenticated user, newest first.
// Also returns the total unread count.
// ---------------------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50) // Reasonable cap to avoid huge payloads
        .lean(),
      Notification.countDocuments({ userId: req.user._id, isRead: false }),
    ]);

    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("getNotifications error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/notifications/read-all
// Marks all unread notifications as read for the authenticated user.
// ---------------------------------------------------------------------------
router.patch("/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("markAllRead error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;