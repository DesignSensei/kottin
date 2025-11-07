"use strict";

// public/js/signup.js
document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("signup-form");
  if (!form) return; // ---------------------- Password toggles (2 fields) ----------------------

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

    if (field.name === "confirmPassword") {
      var password = form.querySelector('[name="password"]').value;
      if (field.value && field.value !== password) return customMessages.mismatch || "Passwords do not match";
    }

    return field.validationMessage || "Please fix this field";
  } // ---------------------- Form & fields ----------------------


  var fieldMap = {
    firstName: form.querySelector('[name="firstName"]'),
    lastName: form.querySelector('[name="lastName"]'),
    email: form.querySelector('[name="email"]'),
    password: form.querySelector('[name="password"]'),
    confirmPassword: form.querySelector('[name="confirmPassword"]'),
    agree: form.querySelector('[name="agree"]')
  };
  var trackedFields = Object.values(fieldMap).filter(Boolean); // ---------------------- Helpers ----------------------

  function setAriaInvalid(inputField, isInvalid) {
    inputField.setAttribute("aria-invalid", isInvalid ? "true" : "false");
  }

  function getErrorContainer(inputField) {
    var container = form.querySelector(".field-error[data-for=\"".concat(inputField.name, "\"]"));

    if (!container) {
      console.warn("Error container not found for field: ".concat(inputField.name));
    }

    return container;
  }

  function clearFieldError(inputField) {
    var container = getErrorContainer(inputField);
    if (container) container.textContent = "";
    inputField.classList.remove("input-error", "is-invalid");
    setAriaInvalid(inputField, false);
  }

  function showFieldError(inputField) {
    var container = getErrorContainer(inputField);
    if (!container) return; // Built-in validity

    var builtInValid = inputField.checkValidity(); // Extra check for confirmPassword

    var mismatch = false;

    if (inputField.name === "confirmPassword") {
      var password = fieldMap.password;
      mismatch = !!(password && inputField.value && inputField.value !== password.value);
    } // If the password changes, re-validate confirmPassword live


    if (inputField.name === "password") {
      var confirmPassword = fieldMap.confirmPassword;

      if (confirmPassword && confirmPassword.value) {
        showFieldError(confirmPassword);
      }
    } // Check for either in-built validit or mismatch


    if (!builtInValid || mismatch) {
      container.textContent = getErrorMessage(inputField);
      inputField.classList.add("input-error", "is-invalid");
      setAriaInvalid(inputField, true);
    } else {
      clearFieldError(inputField);
    }
  } // ---------------------- Live validation ----------------------


  trackedFields.forEach(function (inputField) {
    var eventType = inputField.type === "checkbox" ? "change" : "input";
    inputField.addEventListener(eventType, function () {
      return showFieldError(inputField);
    });
    inputField.addEventListener("blur", function () {
      return showFieldError(inputField);
    });
  }); // Keep confirmPassword in sync if password changes

  if (fieldMap.password && fieldMap.confirmPassword) {
    fieldMap.password.addEventListener("input", function () {
      if (fieldMap.confirmPassword.value) showFieldError(fieldMap.confirmPassword);
    });
  } // ---------------------- Submit handling ----------------------


  form.addEventListener("submit", function _callee(e) {
    var pwdVal, invalidFields, firstInvalid, formData, submitBtn, response;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            e.preventDefault(); // Update inline errors

            trackedFields.forEach(function (inputField) {
              return showFieldError(inputField);
            }); // Check form validity

            pwdVal = fieldMap.password && fieldMap.password.value ? fieldMap.password.value : "";
            invalidFields = trackedFields.filter(function (f) {
              var basicInvalid = !f.checkValidity();
              var isConfirm = f.name === "confirmPassword";
              var mismatch = isConfirm && f.value && f.value !== pwdVal;
              return basicInvalid || mismatch;
            });

            if (!(invalidFields.length > 0)) {
              _context.next = 10;
              break;
            }

            firstInvalid = invalidFields[0];
            _context.next = 8;
            return regeneratorRuntime.awrap(Swal.fire({
              icon: "error",
              title: "Fill the required fields before proceeding",
              confirmButtonText: "Okay, got it",
              allowOutsideClick: false,
              allowEscapeKey: true,
              customClass: {
                title: "swal-title",
                confirmButton: "sawl-confirm-btn"
              }
            }));

          case 8:
            firstInvalid.focus();
            return _context.abrupt("return");

          case 10:
            // Collect form data
            formData = {
              _csrf: form.querySelector('[name="_csrf"]').value,
              firstName: form.querySelector('[name="firstName"]').value,
              lastName: form.querySelector('[name="lastName"]').value,
              email: form.querySelector('[name="email"]').value,
              password: form.querySelector('[name="password"]').value
            }; // Disable submit button

            submitBtn = document.getElementById("primary-button");

            if (submitBtn) {
              submitBtn.disabled = true;
              submitBtn.setAttribute("aria-busy", "true");
            }

            _context.prev = 13;
            _context.next = 16;
            return regeneratorRuntime.awrap(Swal.fire({
              title: "Loading...",
              allowOutsideClick: false,
              didOpen: function didOpen() {
                return Swal.showLoading();
              }
            }));

          case 16:
            _context.next = 18;
            return regeneratorRuntime.awrap(fetch("/signup", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": formData._csrf
              },
              body: JSON.stringify({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password
              })
            }));

          case 18:
            response = _context.sent;

            if (response.ok) {
              _context.next = 21;
              break;
            }

            throw new Error("Submission failed");

          case 21:
            _context.next = 23;
            return regeneratorRuntime.awrap(Swal.fire({
              icon: "success",
              title: "Signup successful!",
              confirmButtonText: "Okay"
            }));

          case 23:
            form.reset();
            trackedFields.forEach(clearFieldError);
            _context.next = 31;
            break;

          case 27:
            _context.prev = 27;
            _context.t0 = _context["catch"](13);
            _context.next = 31;
            return regeneratorRuntime.awrap(Swal.fire({
              icon: "error",
              title: "Submission failed",
              text: _context.t0.message || "An error occurred. Please try again.",
              confirmButtonText: "Try again"
            }));

          case 31:
            _context.prev = 31;

            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.setAttribute("aria-busy", "false");
            }

            return _context.finish(31);

          case 34:
          case "end":
            return _context.stop();
        }
      }
    }, null, null, [[13, 27, 31, 34]]);
  });
});