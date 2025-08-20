const authService = require("../services/authService");
const logger = require("../utils/logger");

exports.showLogin = (req, res) => {
  res.render("auth/login", {
    layout: "layouts/auth-layout",
    title: "Log In",
    wfPage: "66b93fd9c65755b8a91df18e",
    scripts: `
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="/js/login.js"></script>`,
  });
};

exports.showSignup = (req, res) => {
  res.render("auth/signup", {
    layout: "layouts/auth-layout",
    title: "Sign Up",
    wfPage: "66b93fd9c65755b8a91df18e",
    scripts: `
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="/js/signup.js"></script>`,
  });
};

exports.showResetPassword = (req, res) => {
  res.render("auth/reset-password", {
    layout: "layouts/auth-layout-no-index",
    title: "Reset Password",
    wfPage: "66b93fd9c65755b8a91df18e",
    scripts: `
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="/js/reset-password.js"></script>`,
  });
};

exports.showNewPassword = (req, res) => {
  res.render("auth/new-password", {
    layout: "layouts/auth-layout-no-index",
    title: "New Password",
    wfPage: "66b93fd9c65755b8a91df18e",
    scripts: `
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="/js/login.js"></script>`,
  });
};

exports.showTwoFactor = (req, res) => {
  res.render("auth/two-factor", {
    layout: "layouts/auth-layout-no-index",
    title: "Two Factor",
    wfPage: "66b93fd9c65755b8a91df18e",
    scripts: `
      <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
      <script src="/js/login.js"></script>
      <script src="/js/two-factor.js"></script>
    `,
    csrfToken: req.csrfToken(),
  });
};

exports.showNotFound = (req, res) => {
  res.render("auth/not-found", {
    layout: "layouts/auth-layout-no-index",
    title: "Not Found",
    wfPage: "66b93fd9c65755b8a91df18e",
  });
};
