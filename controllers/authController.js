// controllers/authController.js

const User = require("../models/User");
const AuthService = require("../services/authService");
const logger = require("../utils/logger");

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
    scripts: `<script src="/js/signup.js"></script>`,
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
    csrfToken: req.csrfToken(),
  });
};

// Render Not Found Page
exports.getNotFound = (req, res) => {
  res.render("auth/not-found", {
    layout: "layouts/auth-layout-no-index",
    title: "Not Found",
    wfPage: "66b93fd9c65755b8a91df18e",
  });
};

exports.getError = (req, res) => {
  res.render("auth/error", {
    layout: "layouts/auth-layout-no-index",
    title: "Error",
    wfPage: "66b93fd9c65755b8a91df18e",
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

    // 2FA for new accounts (if you want to enforce right after signup)
    const { code, expiresAt } = await AuthService.createTwoFactorChallenge(
      user._id,
      { ttlMs: 5 * 60 * 1000, cost: 12, maxAttempts: 5 }
    );

    if (process.env.NODE_ENV !== "production") {
      logger.info(`2FA code for ${user.email}: ${code}`);
    } // else: send via mail/SMS

    req.session.pending2FA = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      expiresAt,
    };

    req.flash("info", "Enter the 6-digit code we sent.");
    return res.redirect("/two-factor");
  } catch (err) {
    return next(err);
  }
};

// Handle Login Form
exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await AuthService.loginUser({ email, password });

    if (user.twoFactorEnabled) {
      const { code, expiresAt } = await AuthService.createTwoFactorChallenge(
        user._id,
        { ttlMs: 5 * 60 * 1000, cost: 12, maxAttempts: 5 }
      );

      if (process.env.NODE_ENV !== "production") {
        logger.info(`2FA code for ${user.email}: ${code}`);
      } // else: send via mail/SMS

      req.session.pending2FA = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        expiresAt,
      };

      req.flash("info", "Enter the 6-digit code we sent.");
      return res.redirect("/two-factor");
    }

    return req.login(user, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome back!");
      return res.redirect(
        user.role === "super-admin" || user.role === "admin"
          ? "/admin/dashboard"
          : "/home"
      );
    });
  } catch (err) {
    return next(err);
  }
};

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

    req.flash("success", "If that email exists, we’ve sent a reset link.");
    return res.redirect("/reset-password");
  } catch (err) {
    return next(err);
  }
};

exports.postSetNewPassword = async (req, res, next) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token) {
      req.flash("error", "Reset link is invalid or missing");
      return res.redirect("/reset-password");
    }

    if (!password || password !== confirmPassword) {
      req.flash("error", "Passwords do not match");
      return res.redirect(`/new-password?token=${encodeURIComponent(token)}`);
    }

    const user = await AuthService.setNewPassword({ token, password });

    return req.login(user, (err) => {
      if (err) return next(err);
      req.flash("success", "Password updated. You’re now signed in.");
      return res.redirect(
        user.role === "super-admin" || user.role === "admin"
          ? "/admin/dashboard"
          : "/home"
      );
    });
  } catch (err) {
    req.flash("error", err.message || "Could not update password");
    return res.redirect("/reset-password");
  }
};

exports.postVerifyTwoFactor = async (req, res, next) => {
  try {
    const pending = req.session.pending2FA;
    if (!pending) {
      req.flash("info", "Start by logging in.");
      return res.redirect("/login");
    }

    const raw = req.body.code || "";
    const inputCode = String(raw).replace(/\D/g, "").slice(0, 6);

    const result = await AuthService.verifyTwoFactor({
      userId: pending.userId,
      inputCode,
    });

    if (!result.ok) {
      if (result.reason === "expired") {
        req.session.pending2FA = null;
        req.flash(
          "error",
          "Code expired. Please log in again to get a new code."
        );
        return res.redirect("/login");
      }
      if (result.reason === "locked") {
        req.session.pending2FA = null;
        req.flash("error", "Too many attempts. Please log in again.");
        return res.redirect("/login");
      }
      // "mismatch" or "not_found"
      req.flash("error", "Invalid or expired code. Please try again");
      return res.redirect("/two-factor");
    }

    // Success → complete login via Passport
    const user = await User.findById(pending.userId);
    if (!user) {
      req.session.pending2FA = null;
      req.flash("error", "User not found.");
      return res.redirect("/login");
    }

    req.session.pending2FA = null;
    return req.login(user, (err) => {
      if (err) return next(err);
      req.flash("success", "2FA complete!");
      return res.redirect(
        user.role === "admin" || user.role === "super-admin"
          ? "/admin/dashboard"
          : "/home"
      );
    });
  } catch (err) {
    return next(err);
  }
};

exports.postResendTwoFactor = async (req, res, next) => {
  try {
    const pending = req.session.pending2FA;
    if (!pending) {
      req.flash("info", "Start by logging in.");
      return res.redirect("/login");
    }

    const { code, expiresAt } = await AuthService.createTwoFactorChallenge(
      pending.userId,
      { ttlMs: 5 * 60 * 1000, cost: 12, maxAttempts: 5 }
    );

    if (process.env.NODE_ENV !== "production") {
      logger.info(`New 2FA code for ${pending.email}: ${code}`);
    } // else: send via mail/SMS

    req.session.pending2FA.expiresAt = expiresAt;

    req.flash("success", "A new verification code has been sent.");
    return res.redirect("/two-factor");
  } catch (err) {
    next(err);
  }
};

// Handle logout
exports.postLogout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      // Ensure cookie name matches your session config; adjust if custom
      res.clearCookie("connect.sid", { path: "/" });
      if (req.accepts("json")) return res.status(200).json({ ok: true });
      return res.redirect("/login");
    });
  });
};
