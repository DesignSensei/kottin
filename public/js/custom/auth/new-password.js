// public/js/custom/auth/new-password.js

document.addEventListener("DOMContentLoaded", () => {
  // ---------------------- Password toggle ----------------------
  const passwordInput = document.getElementById("password");
  const togglePasswordBtn = document.getElementById("togglePassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const toggleConfirmPasswordBtn = document.getElementById("toggleConfirmPassword");

  // Toggle main password field
  if (passwordInput && togglePasswordBtn) {
    let isVisible = false;
    togglePasswordBtn.innerHTML = feather.icons["eye-off"].toSvg();
    togglePasswordBtn.addEventListener("click", () => {
      isVisible = !isVisible;
      passwordInput.type = isVisible ? "text" : "password";
      togglePasswordBtn.innerHTML = window.feather
        ? feather.icons[isVisible ? "eye" : "eye-off"].toSvg()
        : isVisible;
      togglePasswordBtn.setAttribute("aria-label", isVisible ? "Hide password" : "Show password");
    });
  }

  // Toggle confirm password field
  if (confirmPasswordInput && toggleConfirmPasswordBtn) {
    let isVisible = false;
    toggleConfirmPasswordBtn.innerHTML = feather.icons["eye-off"].toSvg();
    toggleConfirmPasswordBtn.addEventListener("click", () => {
      isVisible = !isVisible;
      confirmPasswordInput.type = isVisible ? "text" : "password";
      toggleConfirmPasswordBtn.innerHTML = window.feather
        ? feather.icons[isVisible ? "eye" : "eye-off"].toSvg()
        : isVisible;
      toggleConfirmPasswordBtn.setAttribute(
        "aria-label",
        isVisible ? "Hide password" : "Show password"
      );
    });
  }

  // ---------------------- Validation Messages ----------------------
  const messages = {
    password: {
      valueMissing: "Password is required",
      tooShort: "Password must be at least 8 characters",
    },
    confirmPassword: {
      valueMissing: "Please confirm your password",
      patternMismatch: "Passwords do not match",
    },
  };

  function getErrorMessage(field) {
    const validity = field.validity;
    const customMessages = messages[field.name] || {};

    if (validity.valueMissing) return customMessages.valueMissing || "This field is required";
    if (validity.typeMismatch) return customMessages.typeMismatch || "Please enter a valid value";
    if (validity.tooShort) return customMessages.tooShort || `Minimum length is ${field.minLength}`;
    if (validity.patternMismatch) return customMessages.patternMismatch || "Values do not match";

    // Custom check: passwords must match
    if (field.name === "confirmPassword") {
      const passwordField = document.getElementById("password");
      if (passwordField && field.value !== passwordField.value) {
        return "Passwords do not match";
      }
    }

    return field.validationMessage || "Please fix this field";
  }

  // ---------------------- Form & helpers ----------------------
  const form = document.getElementById("new-password-form");
  if (!form) return;

  const trackedFields = ["password", "confirmPassword"]
    .map((name) => form.querySelector(`[name="${name}"]`))
    .filter(Boolean);

  function setAriaInvalid(inputField, isInvalid) {
    inputField.setAttribute("aria-invalid", isInvalid ? "true" : "false");
  }

  function getErrorContainer(inputField) {
    return form.querySelector(`.field-error[data-for="${inputField.name}"]`);
  }

  function clearFieldError(inputField) {
    const container = getErrorContainer(inputField);
    if (container) container.textContent = "";
    inputField.classList.remove("input-error", "is-invalid");
    setAriaInvalid(inputField, false);
  }

  function showFieldError(inputField) {
    const container = getErrorContainer(inputField);
    if (!container) return;

    // Check if passwords match (for confirm password field)
    let isValid = inputField.checkValidity();
    if (inputField.name === "confirmPassword" && isValid) {
      const passwordField = document.getElementById("password");
      if (passwordField && inputField.value !== passwordField.value) {
        isValid = false;
      }
    }

    if (!isValid) {
      container.textContent = getErrorMessage(inputField);
      inputField.classList.add("input-error", "is-invalid");
      setAriaInvalid(inputField, true);
    } else {
      clearFieldError(inputField);
    }
  }

  // Live validation
  trackedFields.forEach((inputField) => {
    const eventType = inputField.type === "checkbox" ? "change" : "input";
    inputField.addEventListener(eventType, () => showFieldError(inputField));
    inputField.addEventListener("blur", () => showFieldError(inputField));
  });

  // Re-validate confirm password when main password changes
  if (passwordInput && confirmPasswordInput) {
    passwordInput.addEventListener("input", () => {
      if (confirmPasswordInput.value) {
        showFieldError(confirmPasswordInput);
      }
    });
  }

  // ---------------------- Submit handling (+ SweetAlert2) ----------------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Update inline errors
    trackedFields.forEach((inputField) => showFieldError(inputField));

    // Check if passwords match
    const passwordField = document.getElementById("password");
    const confirmPasswordField = document.getElementById("confirmPassword");
    if (
      passwordField &&
      confirmPasswordField &&
      passwordField.value !== confirmPasswordField.value
    ) {
      if (window.Swal) {
        await Swal.fire({
          icon: "error",
          title: "Passwords do not match",
          text: "Please make sure both password fields match.",
          confirmButtonText: "Okay, got it",
          allowOutsideClick: false,
          allowEscapeKey: true,
          customClass: {
            title: "swal-title",
            confirmButton: "swal-confirm-btn",
          },
        });
      }
      confirmPasswordField.focus();
      return;
    }

    // Collect invalid fields
    const invalidFields = trackedFields.filter((f) => !f.checkValidity());
    if (invalidFields.length > 0) {
      const firstInvalid = invalidFields[0];
      if (window.Swal) {
        await Swal.fire({
          icon: "error",
          title: "Fill the required fields before proceeding",
          confirmButtonText: "Okay, got it",
          allowOutsideClick: false,
          allowEscapeKey: true,
          customClass: {
            title: "swal-title",
            confirmButton: "swal-confirm-btn",
          },
        });
      }
      firstInvalid.focus();
      return;
    }

    // Collect form data
    const formData = {
      _csrf: form.querySelector('[name="_csrf"]').value,
      password: form.querySelector('[name="password"]').value,
      confirmPassword: form.querySelector('[name="confirmPassword"]').value,
    };

    // Disable submit button
    const submitButton = document.getElementById("submit-button");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
    }

    try {
      const response = await fetch("/new-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": formData._csrf,
        },
        credentials: "same-origin",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to reset password");
      }

      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: "Password Reset Successful",
          text: data.message || "Your password has been updated successfully.",
          timer: 2000,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: true,
          customClass: {
            title: "swal-title",
            confirmButton: "swal-confirm-btn",
          },
        });
        window.location.href = data.redirect || "/login";
      } else {
        throw new Error(data.message || "Failed to reset password");
      }
    } catch (error) {
      if (window.Swal) {
        await Swal.fire({
          icon: "error",
          title: "Password Reset Failed",
          text: error.message || "Something went wrong!",
          confirmButtonText: "Okay, got it",
          allowOutsideClick: false,
          allowEscapeKey: true,
          customClass: {
            title: "swal-title",
            confirmButton: "swal-confirm-btn",
          },
        });
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.setAttribute("aria-busy", "false");
      }
    }
  });
});
