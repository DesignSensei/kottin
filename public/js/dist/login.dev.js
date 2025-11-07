"use strict";

document.addEventListener("DOMContentLoaded", function () {
  // ---------------------- Password toggle ----------------------
  var passwordInput = document.getElementById("password");
  var togglePasswordBtn = document.getElementById("togglePassword");

  if (passwordInput && togglePasswordBtn) {
    var isVisible = false;
    togglePasswordBtn.innerHTML = feather.icons["eye-off"].toSvg();
    togglePasswordBtn.addEventListener("click", function () {
      isVisible = !isVisible;
      passwordInput.type = isVisible ? "text" : "password";
      togglePasswordBtn.innerHTML = window.feather ? feather.icons[isVisible ? "eye" : "eye-off"].toSvg() : isVisible;
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

  function getErrorMessage(field) {
    var validity = field.validity;
    var customMessages = messages[field.name] || {};
    if (validity.valueMissing) return customMessages.valueMissing || "This field is required";
    if (validity.typeMismatch) return customMessages.typeMismatch || "Please enter a valid value";
    if (validity.tooShort) return customMessages.tooShort || "Minimum length is ".concat(field.minLength);
    return field.validationMessage || "Please fix this field";
  } // ---------------------- Form & helpers ----------------------


  var form = document.getElementById("login-form");
  if (!form) return;
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
  } // Live validation


  trackedFields.forEach(function (inputField) {
    var eventType = inputField.type === "checkbox" ? "change" : "input";
    inputField.addEventListener(eventType, function () {
      return showFieldError(inputField);
    });
    inputField.addEventListener("blur", function () {
      return showFieldError(inputField);
    });
  }); // ---------------------- Submit handling (+ SweetAlert2) ----------------------

  form.addEventListener("submit", function _callee(e) {
    var invalidFields, firstInvalid, formData, submitButton, response, data;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            e.preventDefault(); // Update inline errors

            trackedFields.forEach(function (inputField) {
              return showFieldError(inputField);
            }); // Collect invalid fields

            invalidFields = trackedFields.filter(function (f) {
              return !f.checkValidity();
            });

            if (!(invalidFields.length > 0)) {
              _context.next = 10;
              break;
            }

            firstInvalid = invalidFields[0];

            if (!window.Swal) {
              _context.next = 8;
              break;
            }

            _context.next = 8;
            return regeneratorRuntime.awrap(Swal.fire({
              icon: "error",
              title: "Fill the required fields before proceeding",
              confirmButtonText: "Okay, got it",
              allowOutsideClick: false,
              allowEscapeKey: true,
              customClass: {
                title: "swal-title",
                confirmButton: "swal-confirm-btn"
              }
            }));

          case 8:
            firstInvalid.focus();
            return _context.abrupt("return");

          case 10:
            // Collect form data
            formData = {
              _csrf: form.querySelector('[name="_csrf"]').value,
              email: form.querySelector('[name="email"]').value,
              password: form.querySelector('[name="password"]').value
            }; // Disable submit button

            submitButton = document.getElementById("submit-button");

            if (submitButton) {
              submitButton.disabled = true;
              submitButton.setAttribute("aria-busy", "true");
            }

            _context.prev = 13;
            _context.next = 16;
            return regeneratorRuntime.awrap(fetch("/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": formData._csrf
              },
              credentials: "same-origin",
              body: JSON.stringify(formData)
            }));

          case 16:
            response = _context.sent;
            _context.next = 19;
            return regeneratorRuntime.awrap(response.json());

          case 19:
            data = _context.sent;

            if (!(!response.ok || !data.success)) {
              _context.next = 22;
              break;
            }

            throw new Error("Incorrect email or password");

          case 22:
            if (!data.success) {
              _context.next = 28;
              break;
            }

            _context.next = 25;
            return regeneratorRuntime.awrap(Swal.fire({
              icon: "success",
              title: "Success",
              text: data.message || (data.user && data.user.name ? "Welcome, ".concat(data.user.name, "!") : "Logged in successfully"),
              timer: 1500,
              showConfirmButton: false,
              allowOutsideClick: false,
              allowEscapeKey: true,
              customClass: {
                title: "swal-title",
                confirmButton: "swal-confirm-btn"
              }
            }));

          case 25:
            window.location.href = data.redirect || "/";
            _context.next = 29;
            break;

          case 28:
            throw new Error(data.message || "Invalid email or password");

          case 29:
            _context.next = 36;
            break;

          case 31:
            _context.prev = 31;
            _context.t0 = _context["catch"](13);

            if (!window.Swal) {
              _context.next = 36;
              break;
            }

            _context.next = 36;
            return regeneratorRuntime.awrap(Swal.fire({
              icon: "error",
              title: "Login Failed",
              text: _context.t0.message || "Something went wrong!",
              confirmButtonText: "Okay, got it",
              allowOutsideClick: false,
              allowEscapeKey: true,
              customClass: {
                title: "swal-title",
                confirmButton: "swal-confirm-btn"
              }
            }));

          case 36:
            _context.prev = 36;

            if (submitButton) {
              submitButton.disabled = false;
              submitButton.setAttribute("aria-busy", "false");
            }

            return _context.finish(36);

          case 39:
          case "end":
            return _context.stop();
        }
      }
    }, null, null, [[13, 31, 36, 39]]);
  });
});