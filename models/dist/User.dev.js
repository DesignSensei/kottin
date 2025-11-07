"use strict";

var _email;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// models/User.js
var mongoose = require("mongoose");

var bcrypt = require("bcryptjs");

var userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: (_email = {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  }, _defineProperty(_email, "required", true), _defineProperty(_email, "trim", true), _email),
  password: {
    type: String,
    required: true,
    select: false
  },
  googleId: {
    type: String,
    index: true,
    unique: true,
    sparse: true
  },
  displayName: {
    type: String,
    trim: true
  },
  photo: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    "enum": ["user", "admin", "super-admin"],
    "default": "user"
  },
  isActive: {
    type: Boolean,
    "default": true
  },
  otpCode: {
    type: String,
    select: false
  },
  otpExpires: {
    type: Date,
    select: false
  },
  otpAttempts: {
    type: Number,
    select: false,
    "default": 0
  },
  otpMaxAttempts: {
    type: Number,
    select: false,
    "default": 5
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },
  twoFactorEnabled: {
    type: Boolean,
    "default": false
  }
}, {
  timestamps: true // adds createdAt & updatedAt

}); // Hash password before saving

userSchema.pre("save", function _callee(next) {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (this.isModified("password")) {
            _context.next = 2;
            break;
          }

          return _context.abrupt("return", next());

        case 2:
          _context.prev = 2;
          _context.next = 5;
          return regeneratorRuntime.awrap(bcrypt.hash(this.password, 12));

        case 5:
          this.password = _context.sent;
          next();
          _context.next = 12;
          break;

        case 9:
          _context.prev = 9;
          _context.t0 = _context["catch"](2);
          next(_context.t0);

        case 12:
        case "end":
          return _context.stop();
      }
    }
  }, null, this, [[2, 9]]);
});

userSchema.methods.comparePassword = function _callee2(password) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(bcrypt.compare(password, this.password));

        case 2:
          return _context2.abrupt("return", _context2.sent);

        case 3:
        case "end":
          return _context2.stop();
      }
    }
  }, null, this);
};

userSchema.virtual("isAdmin").get(function () {
  return this.role === "admin";
});
module.exports = mongoose.model("User", userSchema);