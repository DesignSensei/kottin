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
          } // else: send via mail/SMS


          req.session.pending2FA = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            expiresAt: expiresAt
          };
          req.flash("info", "Enter the 6-digit code we sent.");
          return _context.abrupt("return", res.redirect("/two-factor"));

        case 16:
          _context.prev = 16;
          _context.t0 = _context["catch"](0);
          return _context.abrupt("return", next(_context.t0));

        case 19:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 16]]);
}; // Handle Login Form


exports.postLogin = function _callee2(req, res, next) {
  var _req$body2, email, password, user, _ref2, code, expiresAt;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _req$body2 = req.body, email = _req$body2.email, password = _req$body2.password;
          _context2.next = 4;
          return regeneratorRuntime.awrap(AuthService.loginUser({
            email: email,
            password: password
          }));

        case 4:
          user = _context2.sent;

          if (!user.twoFactorEnabled) {
            _context2.next = 15;
            break;
          }

          _context2.next = 8;
          return regeneratorRuntime.awrap(AuthService.createTwoFactorChallenge(user._id, {
            ttlMs: 5 * 60 * 1000,
            cost: 12,
            maxAttempts: 5
          }));

        case 8:
          _ref2 = _context2.sent;
          code = _ref2.code;
          expiresAt = _ref2.expiresAt;

          if (process.env.NODE_ENV !== "production") {
            logger.info("2FA code for ".concat(user.email, ": ").concat(code));
          } // else: send via mail/SMS


          req.session.pending2FA = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            expiresAt: expiresAt
          };
          req.flash("info", "Enter the 6-digit code we sent.");
          return _context2.abrupt("return", res.redirect("/two-factor"));

        case 15:
          return _context2.abrupt("return", req.login(user, function (err) {
            if (err) return next(err);
            req.flash("success", "Welcome back!");
            return res.redirect(user.role === "super-admin" || user.role === "admin" ? "/admin/dashboard" : "/home");
          }));

        case 18:
          _context2.prev = 18;
          _context2.t0 = _context2["catch"](0);
          return _context2.abrupt("return", next(_context2.t0));

        case 21:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 18]]);
};

exports.postRequestPasswordReset = function _callee3(req, res, next) {
  var email, result, baseUrl, resetUrl;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          email = req.body.email;
          _context3.next = 4;
          return regeneratorRuntime.awrap(AuthService.createPasswordReset({
            email: email
          }));

        case 4:
          result = _context3.sent;

          if (result) {
            baseUrl = process.env.APP_URL || "".concat(req.protocol, "://").concat(req.get("host"));
            resetUrl = "".concat(baseUrl, "/new-password?token=").concat(encodeURIComponent(result.token));
            logger.info("Password reset link:", resetUrl); // dev; email/SMS in prod
          }

          req.flash("success", "If that email exists, we’ve sent a reset link.");
          return _context3.abrupt("return", res.redirect("/reset-password"));

        case 10:
          _context3.prev = 10;
          _context3.t0 = _context3["catch"](0);
          return _context3.abrupt("return", next(_context3.t0));

        case 13:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 10]]);
};

exports.postSetNewPassword = function _callee4(req, res, next) {
  var _req$body3, token, password, confirmPassword, user;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _req$body3 = req.body, token = _req$body3.token, password = _req$body3.password, confirmPassword = _req$body3.confirmPassword;

          if (token) {
            _context4.next = 5;
            break;
          }

          req.flash("error", "Reset link is invalid or missing");
          return _context4.abrupt("return", res.redirect("/reset-password"));

        case 5:
          if (!(!password || password !== confirmPassword)) {
            _context4.next = 8;
            break;
          }

          req.flash("error", "Passwords do not match");
          return _context4.abrupt("return", res.redirect("/new-password?token=".concat(encodeURIComponent(token))));

        case 8:
          _context4.next = 10;
          return regeneratorRuntime.awrap(AuthService.setNewPassword({
            token: token,
            password: password
          }));

        case 10:
          user = _context4.sent;
          return _context4.abrupt("return", req.login(user, function (err) {
            if (err) return next(err);
            req.flash("success", "Password updated. You’re now signed in.");
            return res.redirect(user.role === "super-admin" || user.role === "admin" ? "/admin/dashboard" : "/home");
          }));

        case 14:
          _context4.prev = 14;
          _context4.t0 = _context4["catch"](0);
          req.flash("error", _context4.t0.message || "Could not update password");
          return _context4.abrupt("return", res.redirect("/reset-password"));

        case 18:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 14]]);
};

exports.postVerifyTwoFactor = function _callee5(req, res, next) {
  var pending, raw, inputCode, result, user;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          pending = req.session.pending2FA;

          if (pending) {
            _context5.next = 5;
            break;
          }

          req.flash("info", "Start by logging in.");
          return _context5.abrupt("return", res.redirect("/login"));

        case 5:
          raw = req.body.code || "";
          inputCode = String(raw).replace(/\D/g, "").slice(0, 6);
          _context5.next = 9;
          return regeneratorRuntime.awrap(AuthService.verifyTwoFactor({
            userId: pending.userId,
            inputCode: inputCode
          }));

        case 9:
          result = _context5.sent;

          if (result.ok) {
            _context5.next = 21;
            break;
          }

          if (!(result.reason === "expired")) {
            _context5.next = 15;
            break;
          }

          req.session.pending2FA = null;
          req.flash("error", "Code expired. Please log in again to get a new code.");
          return _context5.abrupt("return", res.redirect("/login"));

        case 15:
          if (!(result.reason === "locked")) {
            _context5.next = 19;
            break;
          }

          req.session.pending2FA = null;
          req.flash("error", "Too many attempts. Please log in again.");
          return _context5.abrupt("return", res.redirect("/login"));

        case 19:
          // "mismatch" or "not_found"
          req.flash("error", "Invalid or expired code. Please try again");
          return _context5.abrupt("return", res.redirect("/two-factor"));

        case 21:
          _context5.next = 23;
          return regeneratorRuntime.awrap(User.findById(pending.userId));

        case 23:
          user = _context5.sent;

          if (user) {
            _context5.next = 28;
            break;
          }

          req.session.pending2FA = null;
          req.flash("error", "User not found.");
          return _context5.abrupt("return", res.redirect("/login"));

        case 28:
          req.session.pending2FA = null;
          return _context5.abrupt("return", req.login(user, function (err) {
            if (err) return next(err);
            req.flash("success", "2FA complete!");
            return res.redirect(user.role === "admin" || user.role === "super-admin" ? "/admin/dashboard" : "/home");
          }));

        case 32:
          _context5.prev = 32;
          _context5.t0 = _context5["catch"](0);
          return _context5.abrupt("return", next(_context5.t0));

        case 35:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 32]]);
};

exports.postResendTwoFactor = function _callee6(req, res, next) {
  var pending, _ref3, code, expiresAt;

  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          pending = req.session.pending2FA;

          if (pending) {
            _context6.next = 5;
            break;
          }

          req.flash("info", "Start by logging in.");
          return _context6.abrupt("return", res.redirect("/login"));

        case 5:
          _context6.next = 7;
          return regeneratorRuntime.awrap(AuthService.createTwoFactorChallenge(pending.userId, {
            ttlMs: 5 * 60 * 1000,
            cost: 12,
            maxAttempts: 5
          }));

        case 7:
          _ref3 = _context6.sent;
          code = _ref3.code;
          expiresAt = _ref3.expiresAt;

          if (process.env.NODE_ENV !== "production") {
            logger.info("New 2FA code for ".concat(pending.email, ": ").concat(code));
          } // else: send via mail/SMS


          req.session.pending2FA.expiresAt = expiresAt;
          req.flash("success", "A new verification code has been sent.");
          return _context6.abrupt("return", res.redirect("/two-factor"));

        case 16:
          _context6.prev = 16;
          _context6.t0 = _context6["catch"](0);
          next(_context6.t0);

        case 19:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 16]]);
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