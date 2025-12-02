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
      unique: true,
      trim: true,
    },

    // URL idenitfier, e,g "bullet-vibrators" and is always unique
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Parent category for nesting, e.g "Bullet Vibrators" is a category but a child of "Vibrators & Massagers"
    // Null for top-level (e.g. “Vibrators & Massagers”)
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    description: {
      type: String,
      default: "",
    },

    sortOrder: {
      type: Number,
      default: 0,
    },

    isActive: {
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

// Check if this is a parent category
categorySchema.virtual("isParent").get(function () {
  return this.parent === null;
});

// Get all direct children of this category
categorySchema.methods.getChildren = async function () {
  return await this.model("Category")
    .find({ parent: this._id, isActive: true })
    .sort("sortOrder name");
};

// Get full path of Category
categorySchema.methods.getPath = async function () {
  const path = [this.name];
  let current = this;

  while (current.path) {
    current = await this.model("Category").findById(current.parent);
    if (current) path.unshift(current.name);
  }

  return path;
};

// Get all parent categories
categorySchema.statics.getParents = async function () {
  return await this.find({ parent: null, isActive: true }).sort("sortOrder name");
};

// Get full category tree (parents with nested children)
categorySchema.statics.getCategoryTree = async function () {
  const parents = await this.find({ parent: null, isActive: true }).sort("sortOrder name");
  const tree = [];

  for (let parent of parents) {
    const children = await this.find({
      parent: parent._id,
      isActive: true,
    }).sort("sortOrder name");

    tree.push({
      _id: parent._id,
      name: parent.name,
      slug: parent.slug,
      description: parent.description,
      sortOrder: parent.sortOrder,
      children: children.map((child) => ({
        _id: child._id,
        name: child.name,
        slug: child.slug,
        description: child.description,
        sortOrder: child.sortOrder,
      })),
    });
  }

  return tree;
};

// Get children by parent ID
categorySchema.statics.getChildrenOf = async function (parentId) {
  return await this.find({
    parent: parentId,
    isActive: true,
  }).sort("sortOrder name");
};

// Helpful indexes
categorySchema.index({ isActive: 1, sortOrder: 1, name: 1 });
categorySchema.index({ parent: 1, isActive: 1 });

module.exports = mongoose.model("Category", categorySchema);
