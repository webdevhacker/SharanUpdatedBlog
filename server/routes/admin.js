/**
 * Admin routes.
 * All routes require authentication + admin role.
 */

const express = require("express");

const {
  getStats,
  getUsers,
  changeRole,
  toggleBan,
  deleteUser,
} = require("../controllers/adminController");

const { protect } = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

const router = express.Router();

// Apply protect + adminOnly to every admin route
router.use(protect, adminOnly);

router.get("/stats", getStats);
router.get("/users", getUsers);
router.patch("/users/:id/role", changeRole);
router.patch("/users/:id/ban", toggleBan);
router.delete("/users/:id", deleteUser);

module.exports = router;