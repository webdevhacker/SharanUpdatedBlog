/**
 * Session Mongoose model.
 * Tracks active refresh-token sessions with device/geo metadata.
 * TTL index auto-expires sessions after 30 days.
 */

const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  // Store the raw refresh token string for lookup and revocation
  refreshToken: {
    type: String,
    required: [true, "Refresh token is required"],
  },
  ip: {
    type: String,
    default: "unknown",
  },
  city: {
    type: String,
    default: "Unknown",
  },
  country: {
    type: String,
    default: "Unknown",
  },
  browser: {
    type: String,
    default: "Unknown",
  },
  os: {
    type: String,
    default: "Unknown",
  },
  device: {
    type: String,
    default: "desktop",
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  // TTL field — MongoDB will delete this document 30 days after creation
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "30d",
  },
});

// Index for fast lookup by userId (list all sessions for a user)
sessionSchema.index({ userId: 1 });
// Index for fast lookup by refreshToken (used on every token refresh & logout)
sessionSchema.index({ refreshToken: 1 });

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
