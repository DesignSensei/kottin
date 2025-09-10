const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shopController");

/* ---------- Public pages (GET) ---------- */
router.get("/shop", shopController.showShop);

module.exports = router;
