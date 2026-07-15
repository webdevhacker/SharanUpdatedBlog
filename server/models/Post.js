/**
 * Post Mongoose model.
 * Represents a blog post with auto-generated slug and read-time calculation.
 */

const mongoose = require("mongoose");
const slugify = require("slugify");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    excerpt: {
      type: String,
      maxlength: [500, "Excerpt cannot exceed 500 characters"],
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      default: "Technology",
    },
    tags: {
      type: [String],
      default: [],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    readTime: {
      type: Number,
      default: 1,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ---------------------------------------------------------------------------
// Pre-save hook: auto-generate slug + calculate read time
// ---------------------------------------------------------------------------
postSchema.pre("validate", async function (next) {
  // --- Slug generation ---
  if (this.isModified("title")) {
    let baseSlug = slugify(this.title, {
      lower: true,
      strict: true, // Remove special characters
      trim: true,
    });

    // Ensure uniqueness: append a short numeric suffix if needed
    let slug = baseSlug;
    let count = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await mongoose
        .model("Post")
        .findOne({ slug, _id: { $ne: this._id } });
      if (!existing) break;
      count += 1;
      slug = `${baseSlug}-${count}`;
    }

    this.slug = slug;
  }

  // --- Read time calculation ---
  // Strip HTML tags from content and count words; 200 words/minute average
  if (this.isModified("content")) {
    const plainText = this.content.replace(/<[^>]+>/g, " ").trim();
    const wordCount = plainText
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    this.readTime = Math.max(1, Math.ceil(wordCount / 200));
  }

  next();
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
