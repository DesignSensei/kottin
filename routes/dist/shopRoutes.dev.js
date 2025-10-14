"use strict";

// routes/shopRoutes.js
var express = require("express");

var router = express.Router();

var shopController = require("../controllers/shopController");
/* ---------- Public pages (GET) ---------- */


router.get("/shop", shopController.showShop);
module.exports = router;