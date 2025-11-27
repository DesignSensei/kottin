// models/Product.js

const mongoose = require("mongoose");

// Tiny slugger funvtion
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

    quantity: {
      type: Number,
      required: true,
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

    // Optional toy-specific specs
    specs: {
      material: String,
      dimensions: {
        length: Number,
        diameter: Number,
      },
      vibrationModes: [String], // e.g. ['pulse','wave']
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

module.exports = mongoose.model("Product", productSchema);
