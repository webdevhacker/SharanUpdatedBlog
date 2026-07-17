/**
 * OTP Mongoose model.
 * Stores one-time passwords for email verification and password reset.
 * MongoDB TTL index auto-deletes documents after 11 minutes.
 */

const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: [true, "OTP is required"],
  },
  purpose: {
    type: String,
    enum: ["verify", "reset", "2fa"],
    required: [true, "Purpose is required"],
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
  },
  // TTL field — MongoDB deletes this document 11 minutes after creation
  // (1-minute buffer after the 10-minute expiresAt window).
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "11m",
  },
});

// Compound index for fast lookups by email + purpose
otpSchema.index({ email: 1, purpose: 1 });

const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;
