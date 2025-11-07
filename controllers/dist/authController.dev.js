"use strict";

// controllers/authController.js
var User = require("../models/User");

var AuthService = require("../services/authService");

var logger = require("../utils/logger"); //─────────────────────────────── AUTH RENDER BLOCK (GET ROUTES) ───────────────────────────────//
// Render Login Page


exports.getLogin = function (req, res) {
  res.render("auth/login", {
    layout: "layouts/auth-layout",
    title: "Log In",
    wfPage: "66b93fd9c65755b8a91df18e",
    scripts: "<script src=\"/js/login.js\"></script>"
  });
}; // Render Signup Page


exports.getSignup = function (req, res) {
  res.render("auth/signup", {
    layout: "layouts/auth-layout",
    title: "Sign Up",
    wfPage: "66b93fd9c65755b8a91df18e",
    scripts: "<script src=\"/js/signup.js\"></script>"
  });
}; // Render Reset Password Page


exports.getResetPassword = function (req, res) {
  res.render("auth/reset-password", {
    layout: "layouts/auth-layout-no-index",
    title: "Reset Password",
    wfPage: "66b93fd9c65755b8a91df18e",
    scripts: "<script src=\"/js/reset-password.js\"></script>"
  });
}; // Render New Password Page


exports.getNewPassword = function (req, res) {
  res.render("auth/new-password", {
    layout: "layouts/auth-layout-no-index",
    title: "New Password",
    wfPage: "66b93fd9c65755b8a91df18e",
    scripts: "<script src=\"/js/login.js\"></script>"
  });
}; // Render Two-Factor Page


exports.getTwoFactor = function (req, res) {
  // Optional guard if you don't have a middleware:
  // if (!req.session.pending2FA) return res.redirect("/login");
  res.render("auth/two-factor", {
    layout: "layouts/auth-layout-no-index",
    title: "Two Factor",
    wfPage: "66b93fd9c65755b8a91df18e",
    scripts: "<script src=\"/js/two-factor.js\"></script>"
  });
}; //─────────────────────────────── AUTH ACTIONS (POST ROUTES) ───────────────────────────────//
// Handle Signup Form


exports.postSignup = function _callee(req, res, next) {
  var _req$body, email, password, firstName, lastName, user, _ref, code, expiresAt;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$body = req.body, email = _req$body.email, password = _req$body.password, firstName = _req$body.firstName, lastName = _req$body.lastName;
          _context.next = 4;
          return regeneratorRuntime.awrap(AuthService.registerUser({
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName
          }));

        case 4:
          user = _context.sent;
          _context.next = 7;
          return regeneratorRuntime.awrap(AuthService.createTwoFactorChallenge(user._id, {
            ttlMs: 5 * 60 * 1000,
            cost: 12,
            maxAttempts: 5
          }));

        case 7:
          _ref = _context.sent;
          code = _ref.code;
          expiresAt = _ref.expiresAt;

          if (process.env.NODE_ENV !== "production") {
            logger.info("2FA code for ".concat(user.email, ": ").concat(code));
          }

          req.session.pending2FA = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            expiresAt: expiresAt
          };
          return _context.abrupt("return", res.json({
            success: true,
            redirect: "/two-factor",
            message: "Enter the 6-digit code sent to your email",
            user: {
              name: user.firstName || user.email.split("@")[0]
            }
          }));

        case 15:
          _context.prev = 15;
          _context.t0 = _context["catch"](0);
          return _context.abrupt("return", res.status(400).json({
            success: false,
            message: _context.t0.message || "Could not create account"
          }));

        case 18:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 15]]);
}; // Handle Login Form


exports.postLogin = function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Server error"
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info.message || "Invalid email or password"
      });
    }

    if (user.twoFactorEnabled) {
      AuthService.createTwoFactorChallenge(user._id, {
        ttlMs: 5 * 60 * 1000,
        cost: 12,
        maxAttempts: 5
      }).then(function (_ref2) {
        var code = _ref2.code,
            expiresAt = _ref2.expiresAt;

        if (process.env.NODE_ENV !== "production") {
          logger.info("2FA code for ".concat(user.email, ": ").concat(code));
        }

        req.session.pending2FA = {
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
          expiresAt: expiresAt
        };
        return res.json({
          success: true,
          redirect: "/two-factor",
          message: "Enter the 6-digit code we sent.",
          user: {
            name: user.displayName || user.firstName || user.email.split("@")[0]
          }
        });
      })["catch"](function (err) {
        return next(err);
      });
      return;
    }

    req.login(user, function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Login failed"
        });
      }

      return res.json({
        success: true,
        redirect: user.role === "super-admin" || user.role === "admin" ? "/admin/dashboard" : "/home",
        message: "Welcome back!",
        user: {
          name: user.displayName || user.firstName || user.email.split("@")[0]
        }
      });
    });
  })(req, res, next);
}; // Handle Password Reset Request


exports.postRequestPasswordReset = function _callee2(req, res, next) {
  var email, result, baseUrl, resetUrl;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          email = req.body.email;
          _context2.next = 4;
          return regeneratorRuntime.awrap(AuthService.createPasswordReset({
            email: email
          }));

        case 4:
          result = _context2.sent;

          if (result) {
            baseUrl = process.env.APP_URL || "".concat(req.protocol, "://").concat(req.get("host"));
            resetUrl = "".concat(baseUrl, "/new-password?token=").concat(encodeURIComponent(result.token));
            logger.info("Password reset link:", resetUrl); // dev; email/SMS in prod
          }

          return _context2.abrupt("return", res.json({
            success: true,
            message: "If that email exists, we've sent a reset link."
          }));

        case 9:
          _context2.prev = 9;
          _context2.t0 = _context2["catch"](0);
          return _context2.abrupt("return", res.status(400).json({
            syccess: false,
            message: _context2.t0.message || "Could not process request"
          }));

        case 12:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 9]]);
};

exports.postSetNewPassword = function _callee3(req, res, next) {
  var _req$body2, token, password, confirmPassword, user;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _req$body2 = req.body, token = _req$body2.token, password = _req$body2.password, confirmPassword = _req$body2.confirmPassword;

          if (token) {
            _context3.next = 4;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            success: false,
            message: "Reset link is invalid or missing"
          }));

        case 4:
          if (!(!password || password !== confirmPassword)) {
            _context3.next = 6;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            success: false,
            message: "Passwords do not match"
          }));

        case 6:
          _context3.next = 8;
          return regeneratorRuntime.awrap(AuthService.setNewPassword({
            token: token,
            password: password
          }));

        case 8:
          user = _context3.sent;
          return _context3.abrupt("return", req.login(user, function (err) {
            if (err) return next(err);
            return res.json({
              success: true,
              redirect: user.role === "super-admin" || user.role === "admin" ? "/admin/dashboard" : "/home",
              message: "Password updated. You’re now signed in.",
              user: {
                name: user.displayName || user.firstName || user.email.split("@")[0]
              }
            });
          }));

        case 12:
          _context3.prev = 12;
          _context3.t0 = _context3["catch"](0);
          return _context3.abrupt("return", res.status(400).json({
            success: false,
            message: _context3.t0.message || "Could not update password"
          }));

        case 15:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 12]]);
};

exports.postVerifyTwoFactor = function _callee4(req, res, next) {
  var pending, raw, inputCode, result, user;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          pending = req.session.pending2FA;

          if (pending) {
            _context4.next = 4;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            success: false,
            message: "Start by logging in."
          }));

        case 4:
          raw = req.body.code || "";
          inputCode = String(raw).replace(/\D/g, "").slice(0, 6);
          _context4.next = 8;
          return regeneratorRuntime.awrap(AuthService.verifyTwoFactor({
            userId: pending.userId,
            inputCode: inputCode
          }));

        case 8:
          result = _context4.sent;

          if (result.ok) {
            _context4.next = 14;
            break;
          }

          if (!(result.reason === "expired" || result.reason === "locked")) {
            _context4.next = 13;
            break;
          }

          req.session.pending2FA = null;
          return _context4.abrupt("return", res.status(400).json({
            success: false,
            redirect: "/login",
            message: result.reason === "expired" ? "Code expired. Please log in again to get a new code." : "Too many attempts. Please log in again."
          }));

        case 13:
          return _context4.abrupt("return", res.status(400).json({
            success: false,
            message: "Invalid or expired code. Please try again"
          }));

        case 14:
          _context4.next = 16;
          return regeneratorRuntime.awrap(User.findById(pending.userId));

        case 16:
          user = _context4.sent;

          if (user) {
            _context4.next = 20;
            break;
          }

          req.session.pending2FA = null;
          return _context4.abrupt("return", res.status(400).json({
            success: false,
            redirect: "/login",
            message: "User not found."
          }));

        case 20:
          req.session.pending2FA = null;
          return _context4.abrupt("return", req.login(user, function (err) {
            if (err) return next(err);
            return res.json({
              success: true,
              redirect: user.role === "admin" || user.role === "super-admin" ? "/admin/dashboard" : "/home",
              message: "2FA complete!",
              user: {
                name: user.displayName || user.firstName || user.email.split("@")[0]
              }
            });
          }));

        case 24:
          _context4.prev = 24;
          _context4.t0 = _context4["catch"](0);
          return _context4.abrupt("return", next(_context4.t0));

        case 27:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 24]]);
};

exports.postResendTwoFactor = function _callee5(req, res, next) {
  var pending, _ref3, code, expiresAt;

  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          pending = req.session.pending2FA;

          if (pending) {
            _context5.next = 4;
            break;
          }

          return _context5.abrupt("return", res.status(400).json({
            success: false,
            redirect: "/login",
            message: "Start by logging in."
          }));

        case 4:
          _context5.next = 6;
          return regeneratorRuntime.awrap(AuthService.createTwoFactorChallenge(pending.userId, {
            ttlMs: 5 * 60 * 1000,
            cost: 12,
            maxAttempts: 5
          }));

        case 6:
          _ref3 = _context5.sent;
          code = _ref3.code;
          expiresAt = _ref3.expiresAt;

          if (process.env.NODE_ENV !== "production") {
            logger.info("New 2FA code for ".concat(pending.email, ": ").concat(code));
          }

          req.session.pending2FA.expiresAt = expiresAt;
          return _context5.abrupt("return", res.json({
            success: true,
            message: "A new verification code has been sent."
          }));

        case 14:
          _context5.prev = 14;
          _context5.t0 = _context5["catch"](0);
          return _context5.abrupt("return", next(_context5.t0));

        case 17:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 14]]);
}; // Handle logout


exports.postLogout = function (req, res, next) {
  req.logout(function (err) {
    if (err) return next(err);
    req.session.destroy(function () {
      // Ensure cookie name matches your session config; adjust if custom
      res.clearCookie("connect.sid", {
        path: "/"
      });
      if (req.accepts("json")) return res.status(200).json({
        ok: true
      });
      return res.redirect("/login");
    });
  });
};