// routes/authRoutes.js

const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/authController");
const { ensureGuest, ensurePending2FA } = require("../middleware/authMiddleware");

/* ---------- Public pages (GET) ---------- */
router.get("/login", ensureGuest, authController.getLogin);
router.get("/signup", ensureGuest, authController.getSignup);
router.get("/reset-password", authController.getResetPassword);
router.get("/new-password", authController.getNewPassword);
router.get("/two-factor", ensurePending2FA, authController.getTwoFactor);

/* ---------- Google OAuth ---------- */
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: true }),
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Googlee authentication failed" });
    }
    res.redirect("/shop");
  }
);

/* ---------- Auth actions (POST) ---------- */
router.post("/signup", authController.postSignup);
router.post("/login", authController.postLogin);
router.post("/reset-password", authController.postRequestPasswordReset);
router.post("/new-password", authController.postSetNewPassword);
router.post("/two-factor", ensurePending2FA, authController.postVerifyTwoFactor);
router.post("/two-factor/resend", ensurePending2FA, authController.postResendTwoFactor);
router.post("/logout", authController.postLogout);

module.exports = router;
