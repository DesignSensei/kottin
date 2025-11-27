// public/js/custom/auth/new-password.js

document.addEventListener("DOMContentLoaded", () => {
  // ---------------------- Password toggle ----------------------
  const passwordInput = document.getElementById("password");
  const togglePasswordBtn = document.getElementById("togglePassword");

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

    if (validity.valueMissing) return customMessages.valueMissing || "This field is required";
    if (validity.typeMismatch) return customMessages.typeMismatch || "Please enter a valid value";
    if (validity.tooShort) return customMessages.tooShort || `Minimum length is ${field.minLength}`;
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

  // ---------------------- Submit handling (+ SweetAlert2) ----------------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Update inline errors
    trackedFields.forEach((inputField) => showFieldError(inputField));

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
      const response = await fetch("/login", {
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
        throw new Error("Incorrect email or password");
      }

      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text:
            data.message ||
            (data.user && data.user.name
              ? `Welcome, ${data.user.name}!`
              : "Logged in successfully"),
          timer: 1500,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: true,
          customClass: {
            title: "swal-title",
            confirmButton: "swal-confirm-btn",
          },
        });
        window.location.href = data.redirect || "/";
      } else {
        throw new Error(data.message || "Invalid email or password");
      }
    } catch (error) {
      if (window.Swal) {
        await Swal.fire({
          icon: "error",
          title: "Login Failed",
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
