// controllers/authController.js

const User = require("../models/User");
const AuthService = require("../services/authService");
const logger = require("../utils/logger");
const passport = require("passport");

//─────────────────────────────── AUTH RENDER BLOCK (GET ROUTES) ───────────────────────────────//

// Render Login Page
exports.getLogin = (req, res) => {
  res.render("auth/login", {
    layout: "layouts/auth-layout",
    title: "Log In",
    wfPage: "66b93fd9c65755b8a91df18e",
    scripts: `<script src="/js/login.js"></script>`,
  });
};

// Render Signup Page
exports.getSignup = (req, res) => {
  res.render("auth/signup", {
    layout: "layouts/auth-layout",
    title: "Sign Up",
    wfPage: "66b93fd9c65755b8a91df18e",
    scripts: `<script type="module" src="/js/signup.js"></script>`,
  });
};

// Render Reset Password Page
exports.getResetPassword = (req, res) => {
  res.render("auth/reset-password", {
    layout: "layouts/auth-layout-no-index",
    title: "Reset Password",
    wfPage: "66b93fd9c65755b8a91df18e",
    scripts: `<script src="/js/reset-password.js"></script>`,
  });
};

// Render New Password Page
exports.getNewPassword = (req, res) => {
  res.render("auth/new-password", {
    layout: "layouts/auth-layout-no-index",
    title: "New Password",
    wfPage: "66b93fd9c65755b8a91df18e",
    scripts: `<script src="/js/login.js"></script>`,
  });
};

// Render Two-Factor Page
exports.getTwoFactor = (req, res) => {
  // Optional guard if you don't have a middleware:
  // if (!req.session.pending2FA) return res.redirect("/login");
  res.render("auth/two-factor", {
    layout: "layouts/auth-layout-no-index",
    title: "Two Factor",
    wfPage: "66b93fd9c65755b8a91df18e",
    scripts: `<script src="/js/two-factor.js"></script>`,
  });
};

//─────────────────────────────── AUTH ACTIONS (POST ROUTES) ───────────────────────────────//

// Handle Signup Form
exports.postSignup = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const user = await AuthService.registerUser({
      email,
      password,
      firstName,
      lastName,
    });

    // 2FA for new accounts
    const { code, expiresAt } = await AuthService.createTwoFactorChallenge(
      user._id,
      { ttlMs: 5 * 60 * 1000, cost: 12, maxAttempts: 5 }
    );

    if (process.env.NODE_ENV !== "production") {
      logger.info(`2FA code for ${user.email}: ${code}`);
    }

    req.session.pending2FA = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      expiresAt,
    };

    return res.json({
      success: true,
      redirect: "/two-factor",
      message: "Enter the 6-digit code sent to your email",
      user: { name: user.firstName || user.email.split("@")[0] },
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Could not create account",
    });
  }
};

// Handle Login Form
exports.postLogin = async (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Server error" });
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        message: info.message || "Invalid email or password",
      });
    }

    if (user.twoFactorEnabled) {
      try {
        const { code, expiresAt } = await AuthService.createTwoFactorChallenge(
          user._id,
          { ttlMs: 5 * 60 * 1000, cost: 12, maxAttempts: 5 }
        );

        // SEND EMAIL
        if (process.env.ENABLE_EMAIL === "true") {
          try {
            const { sendMail } = require("../utils/email");
            await sendMail({
              to: user.email,
              subject: "Your 2FA Verification Code",
              text: `Your code is: ${code}\n\nIt expires in 5 minutes.`,
            });
          } catch (emailErr) {
            logger.error("Failed to send 2FA email:", emailErr);
          }
        }

        if (process.env.NODE_ENV !== "production") {
          logger.info(`2FA code for ${user.email}: ${code}`);
        }

        req.session.pending2FA = {
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
          expiresAt,
        };

        return res.json({
          success: true,
          redirect: "/two-factor",
          message: "Enter the 6-digit code we sent.",
          user: {
            name:
              user.displayName || user.firstName || user.email.split("@")[0],
          },
        });
      } catch (err) {
        return next(err);
      }
    }

    // No 2FA → normal login
    req.login(user, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Login failed" });
      }
      return res.json({
        success: true,
        redirect:
          user.role === "super-admin" || user.role === "admin"
            ? "/admin/dashboard"
            : "/home",
        message: "Welcome back!",
        user: {
          name: user.displayName || user.firstName || user.email.split("@")[0],
        },
      });
    });
  })(req, res, next);
};

// Handle Password Reset Request
exports.postRequestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await AuthService.createPasswordReset({ email });
    if (result) {
      const baseUrl =
        process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
      const resetUrl = `${baseUrl}/new-password?token=${encodeURIComponent(
        result.token
      )}`;
      logger.info("Password reset link:", resetUrl); // dev; email/SMS in prod
    }
    return res.json({
      success: true,
      message: "If that email exists, we've sent a reset link.",
    });
  } catch (err) {
    return res.status(400).json({
      syccess: false,
      message: err.message || "Could not process request",
    });
  }
};

exports.postSetNewPassword = async (req, res, next) => {
  try {
    const { token, password, confirmPassword } = req.body;
    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Reset link is invalid or missing" });
    }
    if (!password || password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }
    const user = await AuthService.setNewPassword({ token, password });
    return req.login(user, (err) => {
      if (err) return next(err);
      return res.json({
        success: true,
        redirect:
          user.role === "super-admin" || user.role === "admin"
            ? "/admin/dashboard"
            : "/home",
        message: "Password updated. You’re now signed in.",
        user: {
          name: user.displayName || user.firstName || user.email.split("@")[0],
        },
      });
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Could not update password",
    });
  }
};

exports.postVerifyTwoFactor = async (req, res, next) => {
  try {
    const pending = req.session.pending2FA;
    if (!pending) {
      return res
        .status(400)
        .json({ success: false, message: "Start by logging in." });
    }
    const raw = req.body.code || "";
    const inputCode = String(raw).replace(/\D/g, "").slice(0, 6);
    const result = await AuthService.verifyTwoFactor({
      userId: pending.userId,
      inputCode,
    });
    if (!result.ok) {
      if (result.reason === "expired" || result.reason === "locked") {
        req.session.pending2FA = null;
        return res.status(400).json({
          success: false,
          redirect: "/login",
          message:
            result.reason === "expired"
              ? "Code expired. Please log in again to get a new code."
              : "Too many attempts. Please log in again.",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Invalid or expired code. Please try again",
      });
    }
    const user = await User.findById(pending.userId);
    if (!user) {
      req.session.pending2FA = null;
      return res.status(400).json({
        success: false,
        redirect: "/login",
        message: "User not found.",
      });
    }
    req.session.pending2FA = null;
    return req.login(user, (err) => {
      if (err) return next(err);
      return res.json({
        success: true,
        redirect:
          user.role === "admin" || user.role === "super-admin"
            ? "/admin/dashboard"
            : "/home",
        message: "2FA complete!",
        user: {
          name: user.displayName || user.firstName || user.email.split("@")[0],
        },
      });
    });
  } catch (err) {
    return next(err);
  }
};

exports.postResendTwoFactor = async (req, res, next) => {
  try {
    const pending = req.session.pending2FA;
    if (!pending) {
      return res.status(400).json({
        success: false,
        redirect: "/login",
        message: "Start by logging in.",
      });
    }

    const { code, expiresAt } = await AuthService.createTwoFactorChallenge(
      pending.userId,
      { ttlMs: 5 * 60 * 1000, cost: 12, maxAttempts: 5 }
    );

    if (process.env.ENABLE_EMAIL === "true") {
      try {
        const { sendMail } = require("../utils/email");
        await sendMail({
          to: pending.email,
          subject: "Your New 2FA Code",
          text: `Your new verification code is: ${code}\n\nIt expires in 5 minutes.`,
        });
      } catch (emailErr) {
        logger.error("Failed to send 2FA email:", emailErr);
      }
    }

    if (process.env.NODE_ENV !== "production") {
      logger.info(`New 2FA code for ${pending.email}: ${code}`);
    }
    req.session.pending2FA.expiresAt = expiresAt;
    return res.json({
      success: true,
      message: "A new verification code has been sent.",
    });
  } catch (err) {
    return next(err);
  }
};

// Handle logout
exports.postLogout = (req, res) => {
  // Passport's logout function
  req.logout(function (error) {
    if (error) {
      logger.error("Logout Error:", error);
      return res.status(500).json({ success: false, message: "Logout failed" });
    }

    // Destroy session
    req.session.destroy((error) => {
      if (error) {
        logger.error("Session Destruction Error:", error);
        // Don't return error - still try to clear cookies
      }

      // Clear all cookies with proper options
      res.clearCookie("connect.sid", { path: "/" });
      res.clearCookie("jwt", { path: "/" });

      // Return JSON, NOT redirect
      return res.status(200).json({ success: true });
    });
  });
};
