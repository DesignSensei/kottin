// models/Category.js

const mongoose = require("mongoose");

// Tiny slugger (turns "Classic Tee" → "classic-tee")
function slugify(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // replace spaces/symbols with "-"
    .replace(/^-+|-+$/g, ""); // trim hyphens from start/end
}

const categorySchema = new mongoose.Schema(
  {
    // Display name, e.g "Bullet Vibrators"
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // URL idenitfier, e,g "bullet-vibrators" and is always unique
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Parent category for nesting, e.g "Bullet Vibrators" is a category but a child of "Vibrators & Massagers"
    // Null for top-level (e.g. “Vibrators & Massagers”)
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Auto-generate slug from name if missing
categorySchema.pre("validate", function (next) {
  if (!this.slug && this.name) this.slug = slugify(this.name);
  next();
});

// Helpful indexes:
// 1) Common reads: only active categories, sorted by sortOrder then name
categorySchema.index({ active: 1, sortOrder: 1, name: 1 });

// 2) For hierarchical queries (fetch children by parent quickly)
categorySchema.index({ parent: 1, active: 1 });

module.exports = mongoose.model("Category", categorySchema);
