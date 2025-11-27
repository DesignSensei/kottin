// services/productService.js

const Product = require("../models/Product");

class ProductService {
  // Fetch all products from the database
  static async getAllProducts() {
    try {
      const products = await Product.find();
      return products;
    } catch (error) {
      throw new Error("Error fetching products: " + error.message);
    }
  }

  // Fetch a single product by its ID
  static async getProductById(productId) {
    try {
      const product = await Product.findById(productId);
      return product;
    } catch (error) {
      throw new Error("Error fetching the product: " + error.message);
    }
  }

  // NEW: Fetch products with pagination and filters
  static async getProductsPaginated(options) {
    const { page = 1, pageSize = 10, search = "", status = "all" } = options;

    try {
      // Build MongoDB query
      let query = {};

      // Search filter - search in name, slug, or description
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } }, // Case-insensitive
          { slug: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      // Status filter
      if (status === "active") {
        query.active = true;
      } else if (status === "inactive") {
        query.active = false;
      }
      // If status is 'all', don't add to query (show both)

      // Count total documents matching the query
      const totalProducts = await Product.countDocuments(query);

      // Calculate pagination
      const skip = (page - 1) * pageSize;
      const totalPages = Math.ceil(totalProducts / pageSize);

      // Fetch products with pagination
      const products = await Product.find(query)
        .populate("categories", "name") // Get category names
        .sort({ createdAt: -1 }) // Newest first
        .skip(skip) // Skip previous pages
        .limit(parseInt(pageSize)); // Limit to page size

      return {
        products,
        totalPages,
        currentPage: parseInt(page),
        totalProducts,
        pageSize: parseInt(pageSize),
      };
    } catch (error) {
      throw new Error("Error fetching paginated products: " + error.message);
    }
  }

  // Get total number of products
  static async getTotalProducts() {
    try {
      const total = await Product.countDocuments();
      return total;
    } catch (error) {
      throw new Error("Error fetching total products: " + error.message);
    }
  }

  // Get number of published products
  static async getPublishedProducts() {
    try {
      const total = await Product.countDocuments({ active: true });
      return total;
    } catch (error) {
      throw new Error("Error fetching published products: " + error.message);
    }
  }

  // Get number of products with low stock (e.g., stock <= 10)
  static async getLowStockProducts() {
    try {
      const total = await Product.countDocuments({ quantity: { $lte: 10 } });
      return total;
    } catch (error) {
      throw new Error("Error fetching low stock products: " + error.message);
    }
  }

  // Get number of out-of-stock products (stock = 0)
  static async getOutOfStockProducts() {
    try {
      const total = await Product.countDocuments({ quantity: 0 });
      return total;
    } catch (error) {
      throw new Error("Error fetching out of stock products: " + error.message);
    }
  }
}

module.exports = ProductService;
