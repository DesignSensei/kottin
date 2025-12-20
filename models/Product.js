// models/Product.js

const mongoose = require("mongoose");

// Tiny slugger function
function slugify(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace spaces/symbols with "-"
    .replace(/^-+|-+$/g, ""); // Trim hyphens from start/end
}

function toMoney(n) {
  if (n == null) return n;
  const num = Number(n);
  if (!Number.isFinite(num) || num < 0) return undefined;
  return Math.round(num * 100) / 100; // ensures price is two decimal points
}

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // ← ADDED
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    description: {
      type: String,
      default: "",
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
    },

    sizes: {
      type: [String],
      enum: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
      default: [],
    },

    colors: {
      type: [String],
      default: [],
    },

    fabric: {
      type: String,
      default: "",
    },

    careInstructions: {
      type: [String],
      default: [],
    },

    gender: {
      type: String,
      enum: ["Unisex", "Men", "Women"],
      default: "Unisex",
    },

    weight: {
      type: Number,
      default: 0,
    },

    basePrice: {
      type: Number,
      required: true,
      set: toMoney, // Format price before saving
    },

    currency: {
      type: String,
      default: "NGN",
    },

    // Link to one or more categories
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],

    // Array of image URLs
    images: {
      type: [String],
      default: [],
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug if missing
productSchema.pre("validate", function (next) {
  if (!this.slug && this.name) this.slug = slugify(this.name);
  next();
});

// Text index for search
productSchema.index(
  { name: "text", description: "text" },
  { weights: { name: 5, description: 1 } }
);

// Helpful read index (common pattern you'll query)
productSchema.index({ active: 1, createdAt: -1 });

// Index for filtering by category and gender
productSchema.index({ categories: 1, gender: 1 });

module.exports = mongoose.model("Product", productSchema);
