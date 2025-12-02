// app.js

const path = require("path");
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const csurf = require("csurf");
const expressLayouts = require("express-ejs-layouts");
const { MongoStore } = require("connect-mongo");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const logger = require("./utils/logger");

// Routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/admin/adminRoutes");
const productRoutes = require("./routes/admin/productRoutes");
// const categoryRoutes = require("./routes/categoryRoutes");
const shopRoutes = require("./routes/shopRoutes");

// API Routes
const apiProductRoutes = require("./routes/api/productRoutes");

// Connect to database
connectDB();

/* ---------- Initialize App ---------- */
const app = express();
const PORT = process.env.PORT || 2000;

/* ---------- App Level Middleware ---------- */
/* ---------- Parsers & static ---------- */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ---------- View engine ---------- */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* ---------- Use layout ---------- */
app.use(expressLayouts);

/* ---------- Request logging ---------- */
app.use((req, res, next) => {
  res.on("finish", () => {
    const message = `${req.method} ${req.originalUrl} ${res.statusCode}`;
    const meta = {
      user: req.user ? req.user.email : "Guest",
      timestamp: new Date().toISOString(),
    };
    logger.info(message, meta);
  });
  next();
});

/* ---------- Cookies + Session ---------- */
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    name: "connect.sid",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

/* ---------- Passport Config ---------- */
require("./config/passport")(passport);

// Initialize Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

/* ---------- CSRF Middleware ---------- */
const csrfProtection = csurf();
app.use((req, res, next) => {
  if (req.path === "/logout" && req.method === "POST") {
    return next(); // Skip CSRF for logout endpoint
  }

  // Apply CSRF to everything else
  csrfProtection(req, res, next);
});

/* ---------- Locals available to all views ---------- */
app.use((req, res, next) => {
  res.locals.csrfToken = typeof req.csrfToken === "function" ? req.csrfToken() : "";
  res.locals.error = "Session expired or form tampered with. Please retry.";
  res.locals.user = req.user || null;
  next();
});

/* ---------- Mount Routes ---------- */
app.use("/admin", adminRoutes);
app.use("/admin/products", productRoutes);
// app.use("/admin/categories", categoryRoutes);
app.use(authRoutes);
app.use(shopRoutes);

/* ---------- Mount API Routes ---------- */
app.use("/admin", apiProductRoutes);

/* ---------- Catch unmatched routes (404) ---------- */
app.use((req, res) => {
  return res.status(404).render("auth/not-found", {
    layout: "layouts/auth-layout-no-index",
    title: "Not Found",
    wfPage: "66b93fd9c65755b8a91df18e",
  });
});

/* ---------- Global Error Handler (CSRF + others) ---------- */
app.use((err, req, res, next) => {
  // CSRF errors
  if (err.code === "EBADCSRFTOKEN") {
    res.status(403);
    res.locals.error = "Session expired or form tampered with. Please retry.";
    return res.redirect(req.get("Referer") || "/");
  }

  const statusCode = err.statusCode || 500;

  if (statusCode === 404) {
    return res.status(404).render("auth/not-found", {
      layout: "layouts/auth-layout-no-index",
      title: "Not Found",
      wfPage: "66b93fd9c65755b8a91df18e",
    });
  }

  // Log and show error page with explicit layout
  logger.error(
    `[${statusCode}] ${req.method} ${req.originalUrl} :: ${err.message}\n${err.stack || ""}`
  );

  return res.status(statusCode).render("auth/error", {
    layout: "layouts/auth-layout-no-index",
    title: "Error",
    message: err.message || "Something went wrong",
    wfPage: "66b93fd9c65755b8a91df18e",
  });
});

/* ---------- Start server ---------- */
app.listen(PORT, () => logger.info(`Server running on http://localhost:${PORT}`));
