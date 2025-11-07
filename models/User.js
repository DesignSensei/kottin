// models/User.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    googleId: {
      type: String,
      index: true,
      unique: true,
      sparse: true,
    },

    displayName: {
      type: String,
      trim: true,
    },

    photo: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["user", "admin", "super-admin"],
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    otpCode: {
      type: String,
      select: false,
    },

    otpExpires: {
      type: Date,
      select: false,
    },

    otpAttempts: {
      type: Number,
      select: false,
      default: 0,
    },

    otpMaxAttempts: {
      type: Number,
      select: false,
      default: 5,
    },

    resetPasswordToken: {
      type: String,
      select: false,
    },

    resetPasswordExpires: {
      type: Date,
      select: false,
    },

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.virtual("isAdmin").get(function () {
  return this.role === "admin";
});

module.exports = mongoose.model("User", userSchema);
