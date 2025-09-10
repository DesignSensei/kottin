"use strict";

document.addEventListener("DOMContentLoaded", function () {
  // ---------------------- Password toggle ----------------------
  var passwordInput = document.getElementById("password");
  var togglePasswordBtn = document.getElementById("togglePassword");

  if (passwordInput && togglePasswordBtn && window.feather) {
    var isVisible = false;
    togglePasswordBtn.innerHTML = feather.icons["eye-off"].toSvg();
    togglePasswordBtn.addEventListener("click", function () {
      isVisible = !isVisible;
      passwordInput.type = isVisible ? "text" : "password";
      togglePasswordBtn.innerHTML = feather.icons[isVisible ? "eye" : "eye-off"].toSvg();
      togglePasswordBtn.setAttribute("aria-label", isVisible ? "Hide password" : "Show password");
    });
  } // ---------------------- Validation Messages ----------------------


  var messages = {
    email: {
      valueMissing: "Email is required",
      typeMismatch: "Enter a valid email address"
    },
    password: {
      valueMissing: "Password is required.",
      tooShort: "Password must be at least 8 characters."
    }
  };

  function getErrorMessage(inputField) {
    var v = inputField.validity;
    var custom = messages[inputField.name] || {};
    if (v.valueMissing) return custom.valueMissing || "This field is required";
    if (v.typeMismatch) return custom.typeMismatch || "Please enter a valid value";
    if (v.tooShort) return custom.tooShort || "Min length is ".concat(inputField.minLength);
    return inputField.validationMessage || "Please fix this field";
  } // ---------------------- Form & helpers ----------------------


  var form = document.getElementById("login-form");
  if (!form) return; // Grab the inputs we care about

  var trackedFields = ["email", "password"].map(function (name) {
    return form.querySelector("[name=\"".concat(name, "\"]"));
  }).filter(Boolean);

  function setAriaInvalid(inputField, isInvalid) {
    inputField.setAttribute("aria-invalid", isInvalid ? "true" : "false");
  }

  function getErrorContainer(inputField) {
    return form.querySelector(".field-error[data-for=\"".concat(inputField.name, "\"]"));
  }

  function clearFieldError(inputField) {
    var container = getErrorContainer(inputField);
    if (container) container.textContent = "";
    inputField.classList.remove("input-error", "is-invalid");
    setAriaInvalid(inputField, false);
  }

  function showFieldError(inputField) {
    var container = getErrorContainer(inputField);
    if (!container) return;

    if (!inputField.checkValidity()) {
      container.textContent = getErrorMessage(inputField);
      inputField.classList.add("input-error", "is-invalid");
      setAriaInvalid(inputField, true);
    } else {
      clearFieldError(inputField);
    }
  } // Live validation: input/blur


  trackedFields.forEach(function (inputField) {
    var eventType = inputField.type === "checkbox" ? "change" : "input";
    inputField.addEventListener(eventType, function () {
      return showFieldError(inputField);
    });
    inputField.addEventListener("blur", function () {
      return showFieldError(inputField);
    });
  }); // Submit handling

  form.addEventListener("submit", function (event) {
    trackedFields.forEach(function (inputField) {
      return showFieldError(inputField);
    });

    if (!form.checkValidity()) {
      event.preventDefault();
      var firstInvalidField = form.querySelector(":invalid");
      if (firstInvalidField) firstInvalidField.focus();
      return;
    } // Optional: prevent double submits


    var submitButton = document.getElementById("submitBtn");

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
    }
  });
});