// controllers/authController.js

const AuthService = require("../services/authService");
const logger = require("../utils/logger");

//─────────────────────────────── AUTH RENDER BLOCK (GET ROUTES) ───────────────────────────────//

// Render Login Page
exports.showLogin = (req, res) => {
  res.render("auth/login", {
    layout: "layouts/auth-layout",
    title: "Log In",
    wfPage: "66b93fd9c65755b8a91df18e",
    scripts: `
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="/js/login.js"></script>`,
  });
};

// Render Signup Page
exports.showSignup = (req, res) => {
  res.render("auth/signup", {
    layout: "layouts/auth-layout",
    title: "Sign Up",
    wfPage: "66b93fd9c65755b8a91df18e",
    scripts: `
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="/js/signup.js"></script>`,
  });
};

// Render Reset Password Page
exports.showResetPassword = (req, res) => {
  res.render("auth/reset-password", {
    layout: "layouts/auth-layout-no-index",
    title: "Reset Password",
    wfPage: "66b93fd9c65755b8a91df18e",
    scripts: `
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="/js/reset-password.js"></script>`,
  });
};

// Render New Password Page
exports.showNewPassword = (req, res) => {
  res.render("auth/new-password", {
    layout: "layouts/auth-layout-no-index",
    title: "New Password",
    wfPage: "66b93fd9c65755b8a91df18e",
    scripts: `
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="/js/login.js"></script>`,
  });
};

// Render Two-Factor Page
exports.showTwoFactor = (req, res) => {
  res.render("auth/two-factor", {
    layout: "layouts/auth-layout-no-index",
    title: "Two Factor",
    wfPage: "66b93fd9c65755b8a91df18e",
    scripts: `
      <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
      <script src="/js/two-factor.js"></script>
    `,
    csrfToken: req.csrfToken(),
  });
};

// Render Not Found Page
exports.showNotFound = (req, res) => {
  res.render("auth/not-found", {
    layout: "layouts/auth-layout-no-index",
    title: "Not Found",
    wfPage: "66b93fd9c65755b8a91df18e",
  });
};

//─────────────────────────────── AUTH ACTIONS (POST ROUTES) ───────────────────────────────//

// Handle Signup Form
exports.signup = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const user = await AuthService.registerUser({
      email,
      password,
      firstName,
      lastName,
    });

    // 2FA for new accounts
    const { code, digest, expiresAt } = AuthService.createTwoFactorChallenge();
    logger.info(`2FA code for ${user.email}: ${code}`);

    req.session.pending2FA = {
      userId: user._id?.toString?.() || user.id,
      email: user.email,
      role: user.role,
      digest,
      expiresAt,
    };

    req.flash("info", "Enter the 6-digit code we sent.");
    return res.redirect("/two-factor");
  } catch (err) {
    return next(err);
  }
};

// Handle Login Form
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await AuthService.loginUser({ email, password });

    if (user.twoFactorEnabled) {
      const { code, digest, expiresAt } =
        AuthService.createTwoFactorChallenge();

      logger.info(`2FA code for ${user.email}: ${code}`);

      req.session.pending2FA = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        digest,
        expiresAt,
      };

      req.flash("info", "Enter the 6-digit code we sent.");
      return res.redirect("/two-factor");
    }

    return req.login(user, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome back!");
      // Role-based redirect
      return res.redirect(user.role === "admin" ? "/admin" : "/shop");
    });
  } catch (err) {
    return next(err);
  }
};

exports.requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await AuthService.createPasswordReset({ email });
    if (result) {
      const baseUrl =
        process.env.APP_URL || `${req.protocol}://${req.get("host")}`;

      const resetUrl = `${baseUrl}/new-password?token=${encodeURIComponent(
        result.token
      )}`;

      logger.info("Password reset link:", resetUrl);
    }

    req.flash("success", "If that email exists, we’ve sent a reset link.");
    return res.redirect("/reset-password");
  } catch (err) {
    return next(err);
  }
};

exports.setNewPassword = async (req, res, next) => {
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

    // Verify Token + set New Password
    const user = await AuthService.setNewPassword({ token, password });

    // Start session
    return req.login(user, (err) => {
      if (err) return next(err);
      req.flash("success", "Password updated. You’re now signed in.");
      return res.redirect(user.role === "admin" ? "/admin" : "/shop");
    });
  } catch (err) {
    req.flash("error", err.message || "Could not update password");
    return res.redirect("/reset-password");
  }
};

exports.verifyTwoFactor = async (req, res, next) => {
  try {
    const pending = req.session.pending2FA;
    if (!pending) {
      req.flash("info", "Start by logging in.");
      return res.redirect("/login");
    }

    const { code } = req.body;
    const ok = AuthService.verifyTwoFactor({
      inputCode: code,
      digest: pending.digest,
      expiresAt: pending.expiresAt,
    });

    if (!ok) {
      req.flash("error", "Invalid or expired code");
      return res.redirect("/two-factor");
    }

    // Promote to logged-in user session
    req.session.user = {
      id: pending.userId,
      email: pending.email,
      role: pending.role,
    };
    delete req.session.pending2FA;

    req.flash("success", "2FA complete!");
    return res.redirect(pending.role === "admin" ? "/admin" : "/shop");
  } catch (err) {
    return next(err);
  }
};

exports.resendTwoFactor = async (req, res, next) => {
  try {
    const pending = req.session.pending2FA;
    if (!pending) {
      req.flash("info", "Start by logging in.");
      return res.redirect("/login");
    }

    const { code, digest, expiresAt } =
      await AuthService.createTwoFactorChallenge();

    // Log only in dev; in prod you’d send via SMS/Email instead
    if (process.env.NODE_ENV !== "production") {
      logger.info(`New 2FA code for ${pending.email}: ${code}`);
    }

    // Update the existing challenge
    req.session.pending2FA.digest = digest;
    req.session.pending2FA.expiresAt = expiresAt;

    req.flash("success", "A new verification code has been sent.");
    return res.redirect("/two-factor");
  } catch (err) {
    next(err);
  }
};

// Handle logout
exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie("connect.sid", { path: "/" });
      if (req.accepts("json")) return res.status(200).json({ ok: true });
      return res.redirect("/login");
    });
  });
};
