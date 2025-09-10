const mongoose = require("mongoose");

// Tiny slugger (turns "Classic Tee" → "classic-tee")
function slugify(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // replace spaces/symbols with "-"
    .replace(/^-+|-+$/g, ""); // trim hyphens from start/end
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

    basePrice: {
      type: Number,
      required: true,
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
