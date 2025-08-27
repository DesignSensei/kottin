// services/authService.js

const User = require("../models/User");
const crypto = require("crypto");

const sha256 = (str) => crypto.createHash("sha256").update(str).digest("hex");

// Generate a 6-digit code
const sixDigits = () =>
  crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");

class AuthService {
  /* ----- Signup ----- */
  static async registerUser({ email, password, firstName, lastName }) {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Account already exists");
    }

    try {
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        twoFactorEnabled: true,
      });

      return user;
    } catch (err) {
      if (err.code === 11000 && err.keyPattern?.email) {
        throw new Error("Account already exists for that email.");
      }
      throw err;
    }
  }

  /* ----- Login ----- */
  static async loginUser({ email, password }) {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const ok = await user.comparePassword(password);
    if (!ok) throw new Error("Invalid email or password");

    // Strip password before returning
    user.password = undefined;
    return user;
  }

  /* ----- Forgot Password ----- */
  static async createPasswordReset({ email }) {
    if (!email) throw new Error("Email is required");

    const normalized = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalized });
    if (!user) return null; // To prevent account enumeration so that attackers don't know which emails are valid

    // Create reset token (store HASH, return RAW)
    const raw = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = sha256(raw);
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    return {
      email: user.email,
      userId: user._id.toString(),
      token: raw,
      expiresAt: user.resetPasswordExpires,
    };
  }

  /* ----- Reset Password ----- */
  static async setNewPassword({ token, password }) {
    // Use reset token to set new password
    const hash = sha256(String(token));
    const user = await User.findOne({
      resetPasswordToken: hash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) throw new Error("Reset link is invalid or expired");

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    user.password = undefined;

    return user;
  }

  /* ----- Create TwoFactor OTP ----- */
  static async createTwoFactorChallenge() {
    const code = sixDigits();
    const digest = sha256(code);
    const expiresAt = Date.now() + 5 * 60 * 1000;

    return { code, digest, expiresAt };
  }

  /* ----- Verify Two Factor ----- */
  static verifyTwoFactor({ inputCode, digest, expiresAt }) {
    if (!inputCode || !digest || !expiresAt) return false;
    if (Date.now() > expiresAt) return false;
    return sha256(String(inputCode).padStart(6, "0")) === digest;
  }
}

module.exports = AuthService;
