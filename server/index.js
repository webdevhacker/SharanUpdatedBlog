/**
 * TechBlog API Server — Entry Point
 *
 * Configures Express with all security middleware, routes,
 * global error handling, and graceful shutdown.
 */

// Load environment variables first, before anything else
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const hpp = require("hpp");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");

const connectDB = require("./utils/db");

// ---------------------------------------------------------------------------
// App initialisation
// ---------------------------------------------------------------------------
const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------------------
// Trust proxy
// Required when running behind nginx, Heroku, Railway, etc.
// ---------------------------------------------------------------------------
if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

// ---------------------------------------------------------------------------
// Security middleware
// ---------------------------------------------------------------------------

// HTTP security headers
app.use(helmet());

// CORS — only allow the configured client origin
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // Allow cookies / Authorization headers
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Sanitise query strings / body against MongoDB operator injection
app.use(mongoSanitize());

// Sanitise user input against XSS attacks
app.use(xssClean());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// ---------------------------------------------------------------------------
// Global rate limiter — 100 requests per 15 minutes per IP
// ---------------------------------------------------------------------------
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please slow down and try again later.",
  },
});

app.use("/api", globalLimiter);

// ---------------------------------------------------------------------------
// Request logging
// ---------------------------------------------------------------------------
if (process.env.NODE_ENV === "production") {
  // Log to a file in production
  const logsDir = path.join(__dirname, "logs");
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

  const accessLogStream = fs.createWriteStream(
    path.join(logsDir, "access.log"),
    { flags: "a" }
  );
  app.use(morgan("combined", { stream: accessLogStream }));
} else {
  // Colourful dev logging to stdout
  app.use(morgan("dev"));
}

// ---------------------------------------------------------------------------
// Body parsing
// ---------------------------------------------------------------------------
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ---------------------------------------------------------------------------
// Static file serving — uploaded avatars and images
// ---------------------------------------------------------------------------
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------
const authRoutes = require("./routes/auth");
const blogRoutes = require("./routes/blog");
const blogUploadRoutes = require("./routes/blogUpload");
const profileRoutes = require("./routes/profile");
const adminRoutes = require("./routes/admin");
const sessionRoutes = require("./routes/sessions");
const notificationRoutes = require("./routes/notifications");
const categoryRoutes = require("./routes/category");

app.use("/api/auth", authRoutes);
app.use("/api/blog", blogUploadRoutes); // Mount upload first to intercept /upload
app.use("/api/blog", blogRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/categories", categoryRoutes);

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "TechBlog API is running.",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// 404 handler — catches all unmatched routes
// ---------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ---------------------------------------------------------------------------
// Global error handler
// Must have 4 parameters for Express to recognise it as an error handler.
// ---------------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(", "),
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
  if (err.name === "TokenExpiredError") {
    return res
      .status(401)
      .json({ success: false, message: "Token has expired." });
  }

  // Multer errors
  if (err.name === "MulterError") {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Generic server error (hide internals in production)
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error."
      : err.message || "Internal server error.";

  return res.status(statusCode).json({ success: false, message });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const startServer = async () => {
  // Connect to MongoDB before accepting requests
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`🚀  Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
    console.log(`    Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
  });

  // ---------------------------------------------------------------------------
  // Graceful shutdown on SIGTERM (Docker, Heroku, PM2, etc.)
  // ---------------------------------------------------------------------------
  process.on("SIGTERM", () => {
    console.log("⚠️   SIGTERM received. Closing HTTP server gracefully...");
    server.close(() => {
      console.log("✅  HTTP server closed.");
      process.exit(0);
    });
  });

  // Also handle SIGINT (Ctrl+C in development)
  process.on("SIGINT", () => {
    console.log("\n⚠️   SIGINT received. Shutting down...");
    server.close(() => {
      console.log("✅  Server shut down.");
      process.exit(0);
    });
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});