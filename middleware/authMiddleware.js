// middleware/authMiddleware.js

// Only allow logged-in users
function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.redirect("/login");
}

// Decide "home" based on role
function roleAssign(role) {
  return ["admin", "super-admin"].includes(role) ? "/admin/dashboard" : "/home";
}

// Only allow guests (not logged in)
// If already logged in, push them to into the app (shop)
function ensureGuest(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated())
    return res.redirect(roleAssign(req.user?.role));
  return next();
}

// Only show 2FA if there is a pending challenge
function ensurePending2FA(req, res, next) {
  if (req.session && req.session.pending2FA) return next();

  req.flash?.("info", "Start by logging in.");
  return res.redirect("/login");
}

// Role-based guard
function ensureRole(...roles) {
  return (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      if (roles.includes(req.user?.role)) return next();
      return res.status(403).send("Forbidden: Insufficient permissions");
    }
    return res.redirect("/login");
  };
}

module.exports = {
  ensureAuth,
  ensureGuest,
  ensurePending2FA,
  ensureRole,
  roleAssign,
};
