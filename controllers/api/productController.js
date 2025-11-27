// controllers/api/productController.js

const ProductService = require("../../services/productService");
const logger = require("../../utils/logger");

//─────────────────────────────── GET ENDPOINTS (JSON RESPONSES) ───────────────────────────────//

exports.getProducts = async (req, res) => {
  try {
    // Extract query parameters from URL
    const { page = 1, pageSize = 10, search = "", status = "all" } = req.query;

    logger.info("API: Fetching products", { page, pageSize, search, status });

    // Get filtered and paginated products from service
    const result = await ProductService.getProductsPaginated({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      search,
      status,
    });

    // Send JSON response
    res.json({
      success: true,
      products: result.products,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      totalProducts: result.totalProducts,
      pageSize: result.pageSize,
    });
  } catch (error) {
    logger.error("Error fetching products via API:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products. Please try again later.",
    });
  }
};

/**
 * Get single product by ID
 * GET /api/products/:id
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    logger.info("API: Fetching product by ID", { id });

    const product = await ProductService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    logger.error("Error fetching product by ID:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch product. Please try again later.",
    });
  }
};

/**
 * Create new product
 * POST /api/products
 */
exports.createProduct = async (req, res) => {
  try {
    // TODO: Implement create product
    res.status(501).json({
      success: false,
      error: "Not implemented yet",
    });
  } catch (error) {
    logger.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create product.",
    });
  }
};

/**
 * Update product
 * PUT /api/products/:id
 */
exports.updateProduct = async (req, res) => {
  try {
    // TODO: Implement update product
    res.status(501).json({
      success: false,
      error: "Not implemented yet",
    });
  } catch (error) {
    logger.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update product.",
    });
  }
};

/**
 * Delete product
 * DELETE /api/products/:id
 */
exports.deleteProduct = async (req, res) => {
  try {
    // TODO: Implement delete product
    res.status(501).json({
      success: false,
      error: "Not implemented yet",
    });
  } catch (error) {
    logger.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete product.",
    });
  }
};
