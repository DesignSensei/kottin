"use strict";

document.addEventListener("DOMContentLoaded", function _callee2() {
  var passwordInput, togglePasswordBtn, isVisible, messages, getErrorMessage, form, trackedFields, setAriaInvalid, getErrorContainer, clearFieldError, showFieldError;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          showFieldError = function _ref5(inputField) {
            var container = getErrorContainer(inputField);
            if (!container) return;

            if (!inputField.checkValidity()) {
              container.textContent = getErrorMessage(inputField);
              inputField.classList.add("input-error", "is-invalid");
              setAriaInvalid(inputField, true);
            } else {
              clearFieldError(inputField);
            }
          };

          clearFieldError = function _ref4(inputField) {
            var container = getErrorContainer(inputField);
            if (container) container.textContent = "";
            inputField.classList.remove("input-error", "is-invalid");
            setAriaInvalid(inputField, false);
          };

          getErrorContainer = function _ref3(inputField) {
            return form.querySelector(".field-error[data-for=\"".concat(inputField.name, "\"]"));
          };

          setAriaInvalid = function _ref2(inputField, isInvalid) {
            inputField.setAttribute("aria-invalid", isInvalid ? "true" : "false");
          };

          getErrorMessage = function _ref(field) {
            var validity = field.validity;
            var customMessages = messages[field.name] || {};
            if (validity.valueMissing) return customMessages.valueMissing || "This field is required";
            if (validity.typeMismatch) return customMessages.typeMismatch || "Please enter a valid value";
            if (validity.tooShort) return customMessages.tooShort || "Minimum length is ".concat(field.minLength);
            return field.validationMessage || "Please fix this field";
          };

          if (!window.vendorsReady) {
            _context2.next = 10;
            break;
          }

          _context2.next = 8;
          return regeneratorRuntime.awrap(window.vendorsReady);

        case 8:
          _context2.next = 13;
          break;

        case 10:
          if (!window.ensureVendors) {
            _context2.next = 13;
            break;
          }

          _context2.next = 13;
          return regeneratorRuntime.awrap(window.ensureVendors());

        case 13:
          // ---------------------- Password toggle ----------------------
          passwordInput = document.getElementById("password");
          togglePasswordBtn = document.getElementById("togglePassword");

          if (passwordInput && togglePasswordBtn && window.feather) {
            isVisible = false;
            togglePasswordBtn.innerHTML = feather.icons["eye-off"].toSvg();
            togglePasswordBtn.addEventListener("click", function () {
              isVisible = !isVisible;
              passwordInput.type = isVisible ? "text" : "password";
              togglePasswordBtn.innerHTML = feather.icons[isVisible ? "eye" : "eye-off"].toSvg();
              togglePasswordBtn.setAttribute("aria-label", isVisible ? "Hide password" : "Show password");
            });
          } // ---------------------- Validation Messages ----------------------


          messages = {
            email: {
              valueMissing: "Email is required",
              typeMismatch: "Enter a valid email address"
            },
            password: {
              valueMissing: "Password is required.",
              tooShort: "Password must be at least 8 characters."
            }
          };
          // ---------------------- Form & helpers ----------------------
          form = document.getElementById("login-form");

          if (form) {
            _context2.next = 20;
            break;
          }

          return _context2.abrupt("return");

        case 20:
          trackedFields = ["email", "password"].map(function (name) {
            return form.querySelector("[name=\"".concat(name, "\"]"));
          }).filter(Boolean);
          // Live validation
          trackedFields.forEach(function (inputField) {
            var eventType = inputField.type === "checkbox" ? "change" : "input";
            inputField.addEventListener(eventType, function () {
              return showFieldError(inputField);
            });
            inputField.addEventListener("blur", function () {
              return showFieldError(inputField);
            });
          }); // ---------------------- Submit handling (+ SweetAlert) ----------------------

          form.addEventListener("submit", function _callee(event) {
            var invalidFields, firstInvalid, formData, submitButton, response, errorMessage;
            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    event.preventDefault(); // Update inline errors

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

                    firstInvalid = invalidFields[0]; // Fire SweetAlert and keep the user on the page

                    if (!window.Swal) {
                      _context.next = 8;
                      break;
                    }

                    _context.next = 8;
                    return regeneratorRuntime.awrap(Swal.fire({
                      icon: "error",
                      title: "Fix the highlighted field",
                      confirmButtonText: "Okay, got it",
                      allowOutsideClick: false,
                      allowEscapeKey: true,
                      buttonstyling: false,
                      customClass: {
                        title: "swal-title",
                        confirmButton: "swal-confirm-btn"
                      }
                    }));

                  case 8:
                    // Focus the first invalid field after the alert
                    firstInvalid.focus();
                    return _context.abrupt("return");

                  case 10:
                    // Collect form data
                    formData = {
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
                    return regeneratorRuntime.awrap(axios.post("/auth/login", formData));

                  case 16:
                    response = _context.sent;

                    if (!window.Swal) {
                      _context.next = 20;
                      break;
                    }

                    _context.next = 20;
                    return regeneratorRuntime.awrap(Swal.fire({
                      icon: "success",
                      title: "Login successful, redirecting you to shop",
                      confirmButtonText: "Okay, got it",
                      allowOutsideClick: false,
                      allowEscapeKey: true,
                      buttonstyling: false,
                      customClass: {
                        title: "swal-title",
                        confirmButton: "swal-confirm-btn"
                      }
                    }));

                  case 20:
                    // Redirect to shop page
                    window.location.href = "/";
                    _context.next = 30;
                    break;

                  case 23:
                    _context.prev = 23;
                    _context.t0 = _context["catch"](13);
                    // Handle errors
                    errorMessage = _context.t0.response.data.message || "Login failed. Please try again.";

                    if (!window.Swal) {
                      _context.next = 29;
                      break;
                    }

                    _context.next = 29;
                    return regeneratorRuntime.awrap(Swal.fire({
                      icon: "error",
                      title: "Login Failed",
                      text: errorMessage,
                      confirmButtonText: "Okay, got it",
                      buttonstyling: false,
                      customClass: {
                        title: "swal-title",
                        confirmButton: "swal-confirm-btn"
                      }
                    }));

                  case 29:
                    // Re-enable submit button
                    if (submitButton) {
                      submitButton.disabled = false;
                      submitButton.setAttribute("aria-busy", "false");
                    }

                  case 30:
                  case "end":
                    return _context.stop();
                }
              }
            }, null, null, [[13, 23]]);
          });

        case 23:
        case "end":
          return _context2.stop();
      }
    }
  });
});