// routes/mainRoutes.js

const express = require("express");
const router = express.Router();
const { ensureRole } = require("../middleware/authMiddleware");
const mainController = require("../controllers/mainController");

/* ---------- Public pages (GET) ---------- */
router.get("/", mainController.showHome);
router.get("/home", mainController.showHome);

/* ==================== ADMIN ==================== */
/* ---------- Public pages (GET) ---------- */
router.get(
  "/admin/dashboard",
  ensureRole("admin", "super-admin"),
  mainController.showDashboard
);

module.exports = router;
