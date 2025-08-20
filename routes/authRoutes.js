const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/authController");

// Auth Render Block (User)
router.get("/login", authController.showLogin);

router.get("/signup", authController.showSignup);

router.get("/reset-password", authController.showResetPassword);

router.get("/new-password", authController.showNewPassword);

router.get("/two-factor", authController.showTwoFactor);

router.get("/not-found", authController.showNotFound);
// Auth Render Endpoints

module.exports = router;
