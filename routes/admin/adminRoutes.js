// routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const { ensureRole } = require("../../middleware/authMiddleware");
const adminController = require("../../controllers/admin/adminController");

/* ---------- Public pages (GET) ---------- */
router.get("/", adminController.showHome);
router.get("/home", adminController.showHome);

/* ==================== ADMIN ==================== */
/* ---------- Public pages (GET) ---------- */
router.get("/dashboard", ensureRole("admin", "super-admin"), adminController.showDashboard);

router.get("/favicon.ico", (req, res) => res.status(204).end());

module.exports = router;
