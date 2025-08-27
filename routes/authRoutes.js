const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/authController");
const {
  ensureAuth,
  ensureGuest,
  ensurePending2FA,
} = require("../middleware/authMiddleware");

/* ---------- Public pages (GET) ---------- */
router.get("/login", ensureGuest, authController.showLogin);

router.get("/signup", ensureGuest, authController.showSignup);

router.get("/reset-password", authController.showResetPassword);

router.get("/new-password", authController.showNewPassword);

router.get("/two-factor", ensurePending2FA, authController.showTwoFactor);

router.get("/not-found", authController.showNotFound);

/* ---------- Google OAuth ---------- */
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login?error=google",
    failureMessage: true,
  }),
  (req, res) => res.redirect("/shop")
);

/* ---------- Auth actions (POST) ---------- */
router.post("/signup", authController.signup);

router.post("/login", authController.login);

router.post("/reset-password", authController.requestPasswordReset);

router.post("/new-password", authController.setNewPassword);

router.post("/two-factor", ensurePending2FA, authController.verifyTwoFactor);

router.post(
  "/two-factor/resend",
  ensurePending2FA,
  authController.resendTwoFactor
);

router.post("/logout", ensureAuth, authController.logout);

module.exports = router;
