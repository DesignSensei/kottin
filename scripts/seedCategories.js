// scripts/seedCategories.js
require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");
const logger = require("../utils/logger");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  logger.info("Database connected");

  // Wipe out existing categories
  await Category.deleteMany({});
  logger.info("Cleared existing categories");

  // Define each top-level group and its children
  const sections = [
    {
      name: "Vibrators & Massagers",
      slug: "vibrators-massagers",
      subs: [
        "Bullet Vibrators",
        "Rabbit Vibrators",
        "Wand Massagers",
        "G-spot Vibrators",
        "Curve and Pulse Vibrators",
        "Wearable Vibrators",
        "App-controlled Vibrators",
      ],
    },
    {
      name: "Dildos & Non-vibrating Plugs",
      slug: "dildos-non-vibrating-plugs",
      subs: [
        "Textured Dildos",
        "Double-ended Dildos",
        "Anal Plugs",
        "Basic Plugs",
        "Vibrating Plugs",
        "Weighted Plugs",
        "Jewel Based/Plus Base Plugs",
      ],
    },
    {
      name: "Couples & Shared Toys",
      slug: "couples-shared-toys",
      subs: [
        "Couples Vibrators",
        "Remote-Control Couples' Rings",
        "Strap-ons & Harnesses",
        "Finger Vibes",
      ],
    },
    {
      name: "Prostate & P-spot Toys",
      slug: "prostate-p-spot-toys",
      subs: ["Prostate Massagers"],
    },
  ];

  let totalCreated = 0;

  // Loop over each section and insert
  for (let section of sections) {
    const parent = await Category.create({
      name: section.name,
      slug: section.slug,
      isActive: true, // Updated field name
      description: "", // New field
    });

    totalCreated++;
    logger.info(`✓ Created parent: ${section.name}`);

    // Map each sub name to a category object
    const children = section.subs.map((name) => ({
      name,
      slug: name
        .toLowerCase()
        .replace(/['™]/g, "") // strip special punctuation
        .replace(/&\s*/g, "and-") // convert & to "and-"
        .replace(/\//g, "-") // convert / to -
        .replace(/\s+/g, "-"), // spaces → hyphens
      parent: parent._id,
      isActive: true, // Updated field name
      description: "", // New field
    }));

    await Category.insertMany(children);
    totalCreated += children.length;
    logger.info(`  └─ Created ${children.length} children`);
  }

  logger.info(`✅ All categories seeded successfully!`);
  logger.info(`📊 Total categories created: ${totalCreated}`);
  logger.info(`   - Parents: ${sections.length}`);
  logger.info(`   - Children: ${totalCreated - sections.length}`);

  mongoose.disconnect();
}

seed().catch((error) => {
  logger.error("Error seeding categories:", error);
  process.exit(1);
});
