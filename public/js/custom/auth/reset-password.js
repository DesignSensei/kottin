// public/js/custom/auth/reset-password.js

document.addEventListener("DOMContentLoaded", () => {
  // ---------------------- Validation Messages ----------------------
  const messages = {
    email: {
      valueMissing: "Email is required",
      typeMismatch: "Enter a valid email address",
    },
  };

  function getErrorMessage(field) {
    const validity = field.validity;
    const customMessages = messages[field.name] || {};

    if (validity.valueMissing) return customMessages.valueMissing || "This field is required";
    if (validity.typeMismatch) return customMessages.typeMismatch || "Please enter a valid value";
    return field.validationMessage || "Please fix this field";
  }

  // ---------------------- Form & helpers ----------------------
  const form = document.getElementById("reset-password-form");
  if (!form) return;

  const trackedFields = ["email"]
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
    };

    // Disable submit button
    const submitButton = document.getElementById("primary-button");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
    }

    try {
      const response = await fetch("/reset-password", {
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
        throw new Error(data.message || "Failed to send reset email");
      }

      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: "Reset Link Sent",
          text:
            data.message ||
            "We've sent a password reset link to your email. Please check your inbox.",
          timer: 3000,
          showConfirmButton: true,
          confirmButtonText: "Okay",
          allowOutsideClick: false,
          allowEscapeKey: true,
          customClass: {
            title: "swal-title",
            confirmButton: "swal-confirm-btn",
          },
        });
      } else {
        throw new Error(data.message || "Failed to send reset email");
      }
    } catch (error) {
      if (window.Swal) {
        await Swal.fire({
          icon: "error",
          title: "Reset Failed",
          text: error.message || "Something went wrong! Please try again.",
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
