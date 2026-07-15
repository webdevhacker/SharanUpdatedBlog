/**
 * Notification Mongoose model.
 * Stores in-app notifications for users (login alerts, password changes, etc.)
 */

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    type: {
      type: String,
      enum: ["login", "password_change", "otp_sent", "account_verified"],
      required: [true, "Notification type is required"],
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Flexible extra data (IP, device, etc.) stored as a plain object
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient per-user queries sorted by newest first
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
