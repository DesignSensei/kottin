const path = require("path");
require("dotenv").config();
const connectDB = require("./config/db");
const logger = require("./utils/logger");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const passport = require("passport");
const csurf = require("csurf");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");

connectDB();

// Initialize app
const app = express();
const PORT = process.env.PORT || 2000;

// App Level Middleware
// Body-parers, static, view engine
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Logging request methods/origin
app.use((req, res, next) => {
  res.on("finish", () => {
    logger.info(`${req.method} ${req.url} ${req.statusCode}`);
  });
  next();
});

// Setting up Express Session + Cookie
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    name: "sid",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 2,
    },
  })
);

// Setting up Flash Messages
app.use(flash());

// Initialize Passport to use sessions
app.use(passport.initialize());
app.use(passport.session());

// CSURF Middleware
app.use(csurf());
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.flash = req.flash();
  next();
});

// Layouts
app.use(expressLayouts);
app.set("layout", "layouts/shop-layout");

// Routes
app.use(authRoutes);

// Catch unmatched routes
app.use((req, res, next) => {
  const error = new Error("Page not found");
  error.status = 404;
  next(error);
});

// Global Error Handler (CSRF + others)
app.use((err, req, res, next) => {
  // CSRF errors
  if (err.code === "EBADCSRFTOKEN") {
    req.flash("error", "Session expired or form tampered with. Please retry.");
    return res.redirect(req.get("Referer" || "/"));
  }

  // 404 errors
  if (err.status === 404) {
    return res.status(404).render("auth/not-found");
  }

  // All other errors (500 etc.)
  logger.error(err.stack);
  res.status(err.status || 500).render("error", { message: err.message });
});

// Start Server after DB is ready
async function start() {
  try {
    await connectDB();
    app.listen(PORT, () =>
      logger.info(`Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    logger.error("Failed to start:", err);
    process.exit(1);
  }
}
start();
