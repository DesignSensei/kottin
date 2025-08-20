const mongoose = require("mongoose");
const logger = require("../utils/logger");

module.exports = async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info(`Connected to MongoDB`);

    require("../models/User");
    if (process.env.NODE_ENV !== "production") {
      await mongoose.model("User").syncIndexes();
      logger.info("user indexes ensured (DEV)");
    } else {
      await mongoose.model("User").init();
      logger.info("user indexes ensured (PROD)");
    }
  } catch (error) {
    logger.error(`Connection Failed: ${error.message}`);
    process.exit(1);
  }
};
