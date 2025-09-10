// services/authService.js

const User = require("../models/User");
const crypto = require("crypto");

const sha256 = (str) => crypto.createHash("sha256").update(str).digest("hex");

// Generate a 6-digit code
const sixDigits = () =>
  crypto.randomInt(0, 1000000).toString().padStart(6, "0");

class AuthService {
  /* --------------- Signup --------------- */
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

      // Strip password before returning
      user.password = undefined;
      return user;
    } catch (err) {
      if (err.code === 11000 && err.keyPattern?.email) {
        throw new Error("Account already exists for that email.");
      }
      throw err;
    }
  }

  /* --------------- Login --------------- */
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

  /* --------------- Forgot Password --------------- */
  static async createPasswordReset({ email }) {
    if (!email) throw new Error("Email is required");

    const user = await User.findOne({ email });
    if (!user) return null; // To prevent account enumeration so that attackers don't know which emails are valid

    // Create reset token (store HASH, return RAW)
    const raw = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    user.resetPasswordToken = sha256(raw);
    user.resetPasswordExpires = expiresAt;

    await user.save({ validateBeforeSave: false });

    return {
      email: user.email,
      userId: user._id.toString(),
      token: raw,
      expiresAt: expiresAt.getTime(),
    };
  }

  /* --------------- Reset Password --------------- */
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

    // clear any active OTP state
    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = undefined;
    user.otpMaxAttempts = undefined;

    await user.save();
    user.password = undefined;
    return user;
  }

  /* --------------- Create TwoFactor OTP --------------- */
  static async createTwoFactorChallenge(
    userId,
    { ttlMs = 5 * 60 * 1000, maxAttempts = 5 } = {}
  ) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const code = sixDigits();
    const expiresAt = new Date(Date.now() + ttlMs);

    user.otpCode = code;
    user.otpExpires = expiresAt;
    user.otpAttempts = 0;
    user.otpMaxAttempts = maxAttempts;

    await user.save({ validateBeforeSave: false });

    return { code, expiresAt: expiresAt.getTime() };
  }

  /* --------------- Verify Two Factor (DB) --------------- */
  static async verifyTwoFactor({ userId, inputCode }) {
    const user = await User.findById(userId).select(
      "+otpCode +otpExpires +otpAttempts +otpMaxAttempts"
    );
    if (!user || !user.otpCode || !user.otpExpires) {
      return { ok: false, reason: "not_found" };
    }

    if (Date.now() > user.otpExpires.getTime()) {
      user.otpCode = undefined;
      user.otpExpires = undefined;
      user.otpAttempts = undefined;
      user.otpMaxAttempts = undefined;
      await user.save({ validateBeforeSave: false });
      return { ok: false, reason: "expired" };
    }

    const attempts = Number(user.otpAttempts || 0);
    const max = Number(user.otpMaxAttempts || 5);
    if (attempts >= max) return { ok: false, reason: "locked" };

    const ok = String(inputCode).padStart(6, "0") === String(user.otpCode);

    if (!ok) {
      user.otpAttempts = attempts + 1;
      await user.save({ validateBeforeSave: false });
      return {
        ok: false,
        reason: user.otpAttempts >= max ? "locked" : "mismatch",
      };
    }

    // On success, clear OTP fields
    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = undefined;
    user.otpMaxAttempts = undefined;
    await user.save({ validateBeforeSave: false });

    return { ok: true };
  }
}

module.exports = AuthService;
