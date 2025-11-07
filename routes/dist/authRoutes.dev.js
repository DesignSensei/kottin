"use strict";

// routes/authRoutes.js
var express = require("express");

var router = express.Router();

var passport = require("passport");

var authController = require("../controllers/authController");

var _require = require("../middleware/authMiddleware"),
    ensureAuth = _require.ensureAuth,
    ensureGuest = _require.ensureGuest,
    ensurePending2FA = _require.ensurePending2FA;
/* ---------- Public pages (GET) ---------- */


router.get("/login", ensureGuest, authController.getLogin);
router.get("/signup", ensureGuest, authController.getSignup);
router.get("/reset-password", authController.getResetPassword);
router.get("/new-password", authController.getNewPassword);
router.get("/two-factor", ensurePending2FA, authController.getTwoFactor);
/* ---------- Google OAuth ---------- */

router.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));
router.get("/auth/google/callback", passport.authenticate("google", {
  session: true
}), function (req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Googlee authentication failed"
    });
  }

  res.redirect("/shop");
});
/* ---------- Auth actions (POST) ---------- */

router.post("/signup", authController.postSignup);
router.post("/login", authController.postLogin);
router.post("/reset-password", authController.postRequestPasswordReset);
router.post("/new-password", authController.postSetNewPassword);
router.post("/two-factor", ensurePending2FA, authController.postVerifyTwoFactor);
router.post("/two-factor/resend", ensurePending2FA, authController.postResendTwoFactor);
router.post("/logout", ensureAuth, authController.postLogout);
module.exports = router;