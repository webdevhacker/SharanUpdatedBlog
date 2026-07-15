const Category = require("../models/Category");
const Post = require("../models/Post");

/**
 * GET /api/categories
 *
 * - Returns all categories
 * - Public access
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error("getCategories error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * POST /api/categories
 *
 * - Admin only
 * - Creates a new category
 */
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const existing = await Category.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (existing) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    const category = await Category.create({ name });
    return res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error("createCategory error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * DELETE /api/categories/:id
 *
 * - Admin only
 * - Deletes a category
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Optional: Reassign posts with this category to 'Uncategorized'
    await Post.updateMany(
      { category: category.name },
      { $set: { category: "Uncategorized" } }
    );

    await category.deleteOne();
    return res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("deleteCategory error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  getCategories,
  createCategory,
  deleteCategory,
};
