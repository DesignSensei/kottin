"use strict";

// public/js/signup.js
document.addEventListener("DOMContentLoaded", function () {
  // ---------------------- Password toggles (2 fields) ----------------------
  var toggleSetups = [{
    input: "password",
    toggle: "togglePassword"
  }, {
    input: "confirmPassword",
    toggle: "toggleConfirmPassword"
  }];
  toggleSetups.forEach(function (_ref) {
    var input = _ref.input,
        toggle = _ref.toggle;
    var passwordInput = document.getElementById(input);
    var toggleBtn = document.getElementById(toggle);
    if (!passwordInput || !toggleBtn) return;
    var visible = false;
    toggleBtn.innerHTML = feather.icons["eye-off"].toSvg();
    toggleBtn.addEventListener("click", function () {
      visible = !visible;
      passwordInput.type = visible ? "text" : "password";
      toggleBtn.innerHTML = feather.icons[visible ? "eye" : "eye-off"].toSvg();
      toggleBtn.setAttribute("aria-label", visible ? "Hide password" : "Show password");
    });
  }); // ---------------------- Validation Messages ----------------------

  var messages = {
    firstName: {
      valueMissing: "First name is required."
    },
    lastName: {
      valueMissing: "Last name is required."
    },
    email: {
      valueMissing: "Email is required.",
      typeMismatch: "Enter a valid email address."
    },
    password: {
      valueMissing: "Password is required.",
      tooShort: "Password must be at least 8 characters."
    },
    confirmPassword: {
      valueMissing: "Please confirm your password.",
      mismatch: "Passwords do not match."
    },
    agree: {
      valueMissing: "You must agree to the Terms and Privacy Policy."
    }
  };

  function getErrorMessage(field) {
    var validity = field.validity;
    var customMessages = messages[field.name] || {};
    if (validity.valueMissing) return customMessages.valueMissing || "This field is required";
    if (validity.typeMismatch) return customMessages.typeMismatch || "Please enter a valid value";
    if (validity.tooShort) return customMessages.tooShort || "Mininum length is ".concat(field.minLength);
    return field.validationMessage || "Please fix this field";
  } // ---------------------- Form & fields ----------------------


  var form = document.getElementById("signup-form");
  if (!form) return;
  var fields = ["firstName", "lastName", "email", "password", "confirmPassword", "agree"].map(function (name) {
    return form.querySelector("[name=\"".concat(name, "\"]"));
  }).filter(Boolean); // ---------------------- Helpers ----------------------

  function setAriaInvalid(field, isInvalid) {
    field.setAttribute("aria-invalid", isInvalid ? "true" : "false");
  }

  function getErrorContainer(field) {
    return form.querySelector(".field-error[data-for=\"".concat(field.name, "\"]"));
  }

  function clearFieldError(field) {
    var container = getErrorContainer(field);
    if (container) container.textContent = "";
    field.classList.remove("input-error", "is-invalid");
    setAriaInvalid(field, false);
  }

  function showFieldError(field) {
    var container = getErrorContainer(field);
    if (!container) return; // Built-in validity

    var builtInValid = field.checkValidity(); // Extra check for confirmPassword

    var mismatch = false;

    if (field.name === "confirmPassword") {
      var pw = form.querySelector('[name="password"]');
      mismatch = !!(pw && field.value && field.value !== pw.value);
    }

    if (!builtInValid || mismatch) {
      container.textContent = getErrorMessage(field, form);
      field.classList.add("input-error", "is-invalid");
      setAriaInvalid(field, true);
    } else {
      clearFieldError(field);
    }
  } // ---------------------- Live validation ----------------------


  fields.forEach(function (field) {
    var eventType = field.type === "checkbox" ? "change" : "input";
    field.addEventListener(eventType, function () {
      return showFieldError(field);
    });
    field.addEventListener("blur", function () {
      return showFieldError(field);
    });
  }); // Keep confirmPassword in sync if password changes

  if (password && confirmPassword) {
    password.addEventListener("input", function () {
      if (confirmPassword.value) showFieldError(confirmPassword);
    });
  } // ---------------------- Submit handling ----------------------


  form.addEventListener("submit", function (e) {
    fields.forEach(function (field) {
      return showFieldError(field);
    });

    if (!form.checkValidity()) {
      e.preventDefault();
      var firstInvalid = form.querySelector(":invalid") || form.querySelector(".is-invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    } // Prevent double submit


    var submitBtn = document.getElementById("primary-button");

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute("aria-busy", "true");
    }
  });
});