document.addEventListener("DOMContentLoaded", async () => {
  // Ensure vendors are ready before using axios/Swal
  if (window.vendorsReady) {
    await window.vendorsReady;
  } else if (window.ensureVendors) {
    await window.ensureVendors();
  }

  // ---------------------- Password toggle ----------------------
  const passwordInput = document.getElementById("password");
  const togglePasswordBtn = document.getElementById("togglePassword");

  if (passwordInput && togglePasswordBtn && window.feather) {
    let isVisible = false;
    togglePasswordBtn.innerHTML = feather.icons["eye-off"].toSvg();
    togglePasswordBtn.addEventListener("click", () => {
      isVisible = !isVisible;
      passwordInput.type = isVisible ? "text" : "password";
      togglePasswordBtn.innerHTML =
        feather.icons[isVisible ? "eye" : "eye-off"].toSvg();
      togglePasswordBtn.setAttribute(
        "aria-label",
        isVisible ? "Hide password" : "Show password"
      );
    });
  }

  // ---------------------- Validation Messages ----------------------
  const messages = {
    email: {
      valueMissing: "Email is required",
      typeMismatch: "Enter a valid email address",
    },
    password: {
      valueMissing: "Password is required.",
      tooShort: "Password must be at least 8 characters.",
    },
  };

  function getErrorMessage(field) {
    const validity = field.validity;
    const customMessages = messages[field.name] || {};

    if (validity.valueMissing)
      return customMessages.valueMissing || "This field is required";

    if (validity.typeMismatch)
      return customMessages.typeMismatch || "Please enter a valid value";

    if (validity.tooShort)
      return customMessages.tooShort || `Minimum length is ${field.minLength}`;

    return field.validationMessage || "Please fix this field";
  }

  // ---------------------- Form & helpers ----------------------
  const form = document.getElementById("login-form");
  if (!form) return;

  const trackedFields = ["email", "password"]
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

    if (!inputField.checkValidity()) {
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

  // ---------------------- Submit handling (+ SweetAlert) ----------------------
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Update inline errors
    trackedFields.forEach((inputField) => showFieldError(inputField));

    // Collect invalid fields
    const invalidFields = trackedFields.filter((f) => !f.checkValidity());
    if (invalidFields.length > 0) {
      const firstInvalid = invalidFields[0];

      // Fire SweetAlert and keep the user on the page
      if (window.Swal) {
        await Swal.fire({
          icon: "error",
          title: "Fix the highlighted field",
          confirmButtonText: "Okay, got it",
          allowOutsideClick: false,
          allowEscapeKey: true,
          buttonstyling: false,
          customClass: {
            title: "swal-title",
            confirmButton: "swal-confirm-btn",
          },
        });
      }

      // Focus the first invalid field after the alert
      firstInvalid.focus();
      return; // stop submission
    }

    // Collect form data
    const formData = {
      email: form.querySelector('[name="email"]').value,
      password: form.querySelector('[name="password"]').value,
    };

    // Disable submit button
    const submitButton = document.getElementById("submit-button");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
    }

    try {
      // Send data to backend
      const response = await axios.post("/auth/login", formData);

      // On success
      if (window.Swal) {
        await Swal.fire({
          icon: "success",
          title: "Login successful, redirecting you to shop",
          confirmButtonText: "Okay, got it",
          allowOutsideClick: false,
          allowEscapeKey: true,
          buttonstyling: false,
          customClass: {
            title: "swal-title",
            confirmButton: "swal-confirm-btn",
          },
        });
      }

      // Redirect to shop page
      window.location.href = "/";
    } catch (error) {
      // Handle errors
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      if (window.Swal) {
        await Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: errorMessage,
          confirmButtonText: "Okay, got it",
          buttonstyling: false,
          customClass: {
            title: "swal-title",
            confirmButton: "swal-confirm-btn",
          },
        });
      }

      // Re-enable submit button
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.setAttribute("aria-busy", "false");
      }
    }
  });
});
