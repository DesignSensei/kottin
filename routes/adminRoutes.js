// routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const { ensureRole } = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

/* ---------- Public pages (GET) ---------- */
router.get("/", adminController.showHome);
router.get("/home", adminController.showHome);

/* ==================== ADMIN ==================== */
/* ---------- Public pages (GET) ---------- */
router.get("/dashboard", adminController.showDashboard);

module.exports = router;
