/**
 * Admin controller.
 * Dashboard stats, user management (list, role change, ban, delete).
 */

const User = require("../models/User");
const Post = require("../models/Post");
const Session = require("../models/Session");
const Notification = require("../models/Notification");
const OTP = require("../models/OTP");

// ---------------------------------------------------------------------------
// getStats
// ---------------------------------------------------------------------------

/**
 * GET /api/admin/stats  (admin)
 *
 * Returns aggregate counts for the admin dashboard.
 */
const getStats = async (req, res) => {
  try {
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalUsers,
      verifiedUsers,
      bannedUsers,
      recentUsers,
    ] = await Promise.all([
      Post.countDocuments(),
      Post.countDocuments({ status: "published" }),
      Post.countDocuments({ status: "draft" }),
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ isBanned: true }),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email avatar role isVerified isBanned createdAt")
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalUsers,
        verifiedUsers,
        bannedUsers,
        recentUsers,
      },
    });
  } catch (error) {
    console.error("getStats error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ---------------------------------------------------------------------------
// getUsers
// ---------------------------------------------------------------------------

/**
 * GET /api/admin/users  (admin)
 * Query params: page, limit, search, role, verified
 *
 * Returns a paginated, filtered list of all users.
 */
const getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const { search = "", role = "", verified = "" } = req.query;

    const filter = {};

    // Text search on name or email
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ name: regex }, { email: regex }];
    }

    // Role filter
    if (role && ["user", "admin"].includes(role)) {
      filter.role = role;
    }

    // Verified filter (accepts "true" / "false" strings from query params)
    if (verified === "true") {
      filter.isVerified = true;
    } else if (verified === "false") {
      filter.isVerified = false;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-password")
        .lean(),
      User.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: { users, total, pages, page },
    });
  } catch (error) {
    console.error("getUsers error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ---------------------------------------------------------------------------
// changeRole
// ---------------------------------------------------------------------------

/**
 * PATCH /api/admin/users/:id/role  (admin)
 * Body: { role: 'user' | 'admin' }
 *
 * - Cannot change own role
 * - Cannot demote the last remaining admin
 */
const changeRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be 'user' or 'admin'.",
      });
    }

    // Cannot change own role
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role.",
      });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Prevent demotion of last admin
    if (targetUser.role === "admin" && role === "user") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot demote the last admin. Promote another user first.",
        });
      }
    }

    targetUser.role = role;
    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: `User role updated to '${role}'.`,
      data: { _id: targetUser._id, name: targetUser.name, role: targetUser.role },
    });
  } catch (error) {
    console.error("changeRole error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ---------------------------------------------------------------------------
// toggleBan
// ---------------------------------------------------------------------------

/**
 * PATCH /api/admin/users/:id/ban  (admin)
 * Body: { isBanned: boolean }
 *
 * - Cannot ban self
 */
const toggleBan = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body;

    if (typeof isBanned !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isBanned must be a boolean.",
      });
    }

    // Cannot ban self
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot ban yourself." });
    }

    const targetUser = await User.findByIdAndUpdate(
      id,
      { isBanned },
      { new: true, select: "-password" }
    );

    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const action = isBanned ? "banned" : "unbanned";

    // If banning, revoke all their sessions immediately
    if (isBanned) {
      await Session.deleteMany({ userId: id });
    }

    return res.status(200).json({
      success: true,
      message: `User has been ${action}.`,
      data: targetUser,
    });
  } catch (error) {
    console.error("toggleBan error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ---------------------------------------------------------------------------
// deleteUser
// ---------------------------------------------------------------------------

/**
 * DELETE /api/admin/users/:id  (admin)
 *
 * - Deletes the user and all associated data:
 *   posts, sessions, notifications, OTPs
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Safety: cannot delete own account via admin panel
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot delete your own account." });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Delete all related data in parallel
    await Promise.all([
      Post.deleteMany({ author: id }),
      Session.deleteMany({ userId: id }),
      Notification.deleteMany({ userId: id }),
      OTP.deleteMany({ email: targetUser.email }),
      User.findByIdAndDelete(id),
    ]);

    return res.status(200).json({
      success: true,
      message: "User and all associated data deleted successfully.",
    });
  } catch (error) {
    console.error("deleteUser error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { getStats, getUsers, changeRole, toggleBan, deleteUser };