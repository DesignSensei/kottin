// app.js

const path = require("path");
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const passport = require("passport");
const csurf = require("csurf");
const expressLayouts = require("express-ejs-layouts");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const logger = require("./utils/logger");
const authRoutes = require("./routes/authRoutes");

// DB Config
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
app.use(expressLayouts);

/* ---------- Request logging ---------- */
app.use((req, res, next) => {
  res.on("finish", () => {
    logger.info(`${req.method} ${req.url} ${req.statusCode}`);
  });
  next();
});

/* ---------- Cookies + Session (must be before flash/passport/csurf) ---------- */
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    name: "sid",
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

/* ---------- Flash Middleware ---------- */
app.use(flash());

/* ---------- Passport Config ---------- */
require("./config/passport")(passport);
// Initialize Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

/* ---------- CSRF Middleware ---------- */
app.use(csurf());

/* ---------- Locals available to all views ---------- */
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.flash = req.flash();
  next();
});

/* ---------- Routes ---------- */
app.use("/", authRoutes);

/* ---------- Catch unmatched routes (create 404) ---------- */
app.use((req, res, next) => {
  const err = new Error("Page not found");
  err.statusCode = 404;
  next(err);
});

/* ---------- Global Error Handler (CSRF + others) ---------- */
app.use((err, req, res, next) => {
  // CSRF errors
  if (err.code === "EBADCSRFTOKEN") {
    res.status(403);
    req.flash("error", "Session expired or form tampered with. Please retry.");
    return res.redirect(req.get("Referer") || "/");
  }

  if (err.statusCode === 404) {
    return res.status(404).render("auth/not-found");
  }

  logger.error(
    `[${statusCode}] ${req.method} ${req.originalUrl} :: ${err.message}\n${
      err.stack || ""
    }`
  );
  return res
    .status(err.statusCode || 500)
    .render("error", { message: err.message || "Something went wrong" });
});

/* ---------- Start server ---------- */
app.listen(PORT, () =>
  logger.info(`Server running on http://localhost:${PORT}`)
);
