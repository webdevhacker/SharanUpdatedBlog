/**
 * Blog routes.
 * Public GET routes are accessible without authentication.
 * Create / Update / Delete / Status-change require admin privileges.
 */

const express = require("express");

const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleStatus,
} = require("../controllers/blogController");

const { protect } = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

const router = express.Router();

// ---------------------------------------------------------------------------
// Public routes
// Note: protect is added as optional middleware (no error if token missing)
// so that admins can also access draft posts on the same endpoint.
// ---------------------------------------------------------------------------

// Optional auth helper — attaches req.user if a valid token is present but
// does NOT reject anonymous requests. Used on read-only public endpoints.
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(); // No token provided — continue as anonymous
  }

  // If a token is present, run the full protect middleware
  return protect(req, res, next);
};

router.get("/posts", optionalAuth, getPosts);
router.get("/posts/:slug", optionalAuth, getPost);

// ---------------------------------------------------------------------------
// Admin-only routes
// ---------------------------------------------------------------------------
router.post("/posts", protect, adminOnly, createPost);
router.put("/posts/:id", protect, adminOnly, updatePost);
router.delete("/posts/:id", protect, adminOnly, deletePost);
router.patch("/posts/:id/status", protect, adminOnly, toggleStatus);

module.exports = router;