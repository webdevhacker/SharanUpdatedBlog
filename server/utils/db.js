/**
 * MongoDB connection utility using Mongoose.
 * Handles connection with proper logging and error handling.
 */

const mongoose = require("mongoose");

/**
 * Connect to MongoDB using the MONGO_URI environment variable.
 * Exits the process on failure so the app does not run without a DB.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 8+ no longer needs these deprecated options,
      // but we keep it clean and future-proof.
    });

    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌  MongoDB connection failed: ${error.message}`);
    process.exit(1); // Exit with failure code
  }
};

module.exports = connectDB;
