// controllers/productController.js

const ProductService = require("../../services/productService");
const logger = require("../../utils/logger");
// const CategoryService = require("../services/categoryService");

//─────────────────────────────── PRODUCT RENDER BLOCK (GET ROUTES) ───────────────────────────────//

// Render Product List Page
exports.listProduct = async (req, res) => {
  try {
    // Fetch products using the ProductService or directly with Mongoose
    const products = await ProductService.getAllProducts();

    const totalProducts = await ProductService.getTotalProducts();
    const publishedProducts = await ProductService.getPublishedProducts();
    const lowStockProducts = await ProductService.getLowStockProducts();
    const outOfStockProducts = await ProductService.getOutOfStockProducts();

    // Render view with data
    res.render("admin/products/listing", {
      layout: "layouts/admin-layout",
      title: "Products",
      pageTitle: "Products",
      breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "Products", url: null },
      ],
      products,
      totalProducts,
      publishedProducts,
      lowStockProducts,
      outOfStockProducts,
      scripts: `<script src="/js/custom/products/listing.js"></script>
      <script src="/assets/plugins/custom/datatables/datatables.bundle.js"></script>
      `,
    });
  } catch (error) {
    logger.error("Error retrieving products:", error);
    res.status(500).json({
      error: "Unable to retrieve products. Please try again later.",
    });
  }
};
