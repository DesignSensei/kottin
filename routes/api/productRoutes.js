// routes/api/productRoutes.js

const express = require("express");
const router = express.Router();
const apiProductController = require("../../controllers/api/productController");
const { ensureApiRole } = require("../../middleware/authMiddleware");

// Enforce middleware so that only admin or super-admin roles can access these routes
router.use(ensureApiRole("admin", "super-admin"));

/* ---------- GET API Routes (Return JSON) ---------- */

// Get paginated products with filters
router.get("/api/products", apiProductController.getProducts);

// Get single product by ID
// router.get("/products/:id", apiProductController.getProductById);

/* ---------- ACTION API Routes (Return JSON) ---------- */

// Create new product
// router.post("/products", apiProductController.createProduct);

// Update product
// router.put("/products/:id", apiProductController.updateProduct);

// Delete product
// router.delete("/products/:id", apiProductController.deleteProduct);

module.exports = router;
