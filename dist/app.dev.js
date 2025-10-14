"use strict";

// app.js
var path = require("path");

require("dotenv").config();

var express = require("express");

var session = require("express-session");

var cookieParser = require("cookie-parser");

var flash = require("connect-flash");

var passport = require("passport");

var csurf = require("csurf");

var expressLayouts = require("express-ejs-layouts");

var MongoStore = require("connect-mongo");

var mongoose = require("mongoose");

var connectDB = require("./config/db");

var logger = require("./utils/logger"); // Routes


var authRoutes = require("./routes/authRoutes");

var mainRoutes = require("./routes/mainRoutes");

var shopRoutes = require("./routes/shopRoutes"); // Connect to database


connectDB();
/* ---------- Initialize App ---------- */

var app = express();
var PORT = process.env.PORT || 2000;
/* ---------- App Level Middleware ---------- */

/* ---------- Parsers & static ---------- */

app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(express["static"](path.join(__dirname, "public")));
/* ---------- View engine ---------- */

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
/* ---------- Use layout ---------- */

app.use(expressLayouts);
/* ---------- Request logging ---------- */

app.use(function (req, res, next) {
  res.on("finish", function () {
    logger.info("".concat(req.method, " ").concat(req.originalUrl, " ").concat(res.statusCode));
  });
  next();
});
/* ---------- Cookies + Session ---------- */

app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  name: "sid",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    client: mongoose.connection.getClient(),
    collectionName: "sessions"
  }),
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));
/* ---------- Flash Middleware ---------- */

app.use(flash());
/* ---------- Passport Config ---------- */

require("./config/passport")(passport); // Initialize Passport Middleware


app.use(passport.initialize());
app.use(passport.session());
/* ---------- CSRF Middleware ---------- */

app.use(csurf());
/* ---------- Locals available to all views ---------- */

app.use(function (req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  res.locals.flash = {
    success: req.flash("success"),
    error: req.flash("error"),
    info: req.flash("info"),
    warning: req.flash("warning")
  };
  res.locals.user = req.user || null;
  next();
});
/* ---------- Mount Routes ---------- */

app.use("/", mainRoutes);
app.use(authRoutes);
app.use(shopRoutes);
/* ---------- Catch unmatched routes (404) ---------- */

app.use(function (req, res) {
  return res.status(404).render("auth/not-found", {
    layout: "layouts/auth-layout-no-index",
    title: "Not Found",
    wfPage: "66b93fd9c65755b8a91df18e"
  });
});
/* ---------- Global Error Handler (CSRF + others) ---------- */

app.use(function (err, req, res, next) {
  // CSRF errors
  if (err.code === "EBADCSRFTOKEN") {
    res.status(403);
    req.flash("error", "Session expired or form tampered with. Please retry.");
    return res.redirect(req.get("Referer") || "/");
  }

  var statusCode = err.statusCode || 500;

  if (statusCode === 404) {
    return res.status(404).render("auth/not-found", {
      layout: "layouts/auth-layout-no-index",
      title: "Not Found",
      wfPage: "66b93fd9c65755b8a91df18e"
    });
  } // Log and show error page with explicit layout


  logger.error("[".concat(statusCode, "] ").concat(req.method, " ").concat(req.originalUrl, " :: ").concat(err.message, "\n").concat(err.stack || ""));
  return res.status(statusCode).render("auth/error", {
    layout: "layouts/auth-layout-no-index",
    title: "Error",
    message: err.message || "Something went wrong",
    wfPage: "66b93fd9c65755b8a91df18e"
  });
});
/* ---------- Start server ---------- */

app.listen(PORT, function () {
  return logger.info("Server running on http://localhost:".concat(PORT));
});