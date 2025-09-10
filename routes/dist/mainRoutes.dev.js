"use strict";

// routes/mainRoutes.js
var express = require("express");

var router = express.Router();

var _require = require("../middleware/authMiddleware"),
    ensureRole = _require.ensureRole;

var mainController = require("../controllers/mainController");
/* ---------- Public pages (GET) ---------- */


router.get("/", mainController.showHome);
router.get("/home", mainController.showHome);
/* ==================== ADMIN ==================== */

/* ---------- Public pages (GET) ---------- */

router.get("/admin/dashboard", ensureRole("admin", "super-admin"), mainController.showDashboard);
module.exports = router;