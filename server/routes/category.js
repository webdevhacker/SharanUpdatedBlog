const express = require("express");

const {
  getCategories,
  createCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const { protect } = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

const router = express.Router();

router.get("/", getCategories);
router.post("/", protect, adminOnly, createCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);

module.exports = router;
