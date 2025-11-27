// public/js/custom/auth/signup.js

import { LoadingOverlay } from "../../utils/loading.js";

document.addEventListener("DOMContentLoaded", () => {
  // ----------------- Form, fields, and validation messages -----------------
  const form = document.getElementById("signup-form");

  const fieldMap = {
    firstName: form.querySelector('[name="firstName"]'),
    lastName: form.querySelector('[name="lastName"]'),
    email: form.querySelector('[name="email"]'),
    password: form.querySelector('[name="password"]'),
    confirmPassword: form.querySelector('[name="confirmPassword"]'),
    agree: form.querySelector('[name="agree"]'),
  };

  const trackedFields = Object.values(fieldMap).filter(Boolean);

  const messages = {
    firstName: {
      valueMissing: "First name is required",
      tooShort: "First name must be at least 2 characters",
    },
    lastName: {
      valueMissing: "Last name is required",
      tooShort: "Last name must be at least 2 characters",
    },
    email: {
      valueMissing: "Email is required",
      typeMismatch: "Please enter a valid email address",
    },
    password: {
      valueMissing: "Password is required",
      tooShort: "Password must be at least 8 characters",
    },
    confirmPassword: {
      valueMissing: "Please confirm your password",
      mismatch: "Passwords do not match",
    },
    agree: { valueMissing: "You must agree to the Terms and Privacy Policy" },
  };

  // ---------------------- Helpers ----------------------
  function getErrorMessage(field) {
    const validity = field.validity;
    const customMessages = messages[field.name] || {};
    if (validity.valueMissing) return customMessages.valueMissing || "This field is required";
    if (validity.typeMismatch) return customMessages.typeMismatch || "Please enter a valid value";
    if (validity.tooShort) return customMessages.tooShort || `Minimum length is ${field.minLength}`;
    if (field.name === "confirmPassword") {
      const password = fieldMap.password?.value || "";
      if (field.value && field.value !== password)
        return customMessages.mismatch || "Passwords do not match";
    }
    return field.validationMessage || "Please fix this field";
  }

  function setAriaInvalid(inputField, isInvalid) {
    inputField.setAttribute("aria-invalid", isInvalid ? "true" : "false");
  }

  function getErrorContainer(inputField) {
    const container = form.querySelector(`.field-error[data-for="${inputField.name}"]`);
    if (!container) {
      const newContainer = document.createElement("div");
      newContainer.className = "field-error";
      newContainer.setAttribute("data-for", inputField.name);
      newContainer.id = `error-${inputField.name}`;
      newContainer.setAttribute("aria-live", "polite");

      let wrapper = inputField.parentNode;
      while (wrapper && !wrapper.classList.contains("inner-container")) {
        wrapper = wrapper.parentNode;
      }

      if (wrapper && wrapper.classList.contains("inner-container")) {
        wrapper.appendChild(newContainer);
      } else {
        inputField.parentNode.insertBefore(newContainer, inputField.nextSibling);
      }

      console.warn(`Created error container for ${inputField.name}`);
      return newContainer;
    }
    return container;
  }

  function showFieldError(inputField) {
    const container = getErrorContainer(inputField);
    if (!container) return;

    // Check normal rules (required, email format, etc.)
    const builtInValid = inputField.checkValidity();

    // Check if passwords match (only for confirmPassword)
    let mismatch = false;

    if (inputField.name === "confirmPassword") {
      const password = fieldMap.password?.value || "";
      console.log("Password:", password);
      console.log("Confirm Password:", inputField.value);
      mismatch = inputField.value && inputField.value !== password;
    }

    // If we’re in Password, tell Confirm to check itself
    if (inputField.name === "password") {
      const confirmPassword = fieldMap.confirmPassword;
      if (confirmPassword && confirmPassword.value) showFieldError(confirmPassword);
    }

    if (!builtInValid || (inputField.name === "confirmPassword" && mismatch)) {
      container.textContent = getErrorMessage(inputField);
      inputField.classList.add("input-error", "is-invalid");
      setAriaInvalid(inputField, true);
      inputField.setAttribute("aria-describedby", container.id);
    } else {
      clearFieldError(inputField);
    }
  }

  function clearFieldError(inputField) {
    const container = getErrorContainer(inputField);
    if (container) container.textContent = "";
    inputField.classList.remove("input-error", "is-invalid");
    setAriaInvalid(inputField, false);
    inputField.removeAttribute("aria-describedby");
  }

  // ---------------------- Password toggles (2 fields) ----------------------
  const toggleSetups = [
    { input: "password", toggle: "togglePassword" },
    { input: "confirmPassword", toggle: "toggleConfirmPassword" },
  ];

  toggleSetups.forEach(({ input, toggle }) => {
    const passwordInput = document.getElementById(input);
    const toggleBtn = document.getElementById(toggle);
    if (!passwordInput || !toggleBtn) return;

    let visible = false;
    toggleBtn.innerHTML = feather?.icons["eye-off"]?.toSvg() || "Show";

    toggleBtn.addEventListener("click", () => {
      visible = !visible;
      passwordInput.type = visible ? "text" : "password";
      toggleBtn.innerHTML =
        feather?.icons[visible ? "eye" : "eye-off"]?.toSvg() || (visible ? "Hide" : "Show");
      toggleBtn.setAttribute("aria-label", visible ? "Hide password" : "Show password");
    });
  });

  // ---------------------- Live validation ----------------------
  trackedFields.forEach((inputField) => {
    const eventType = inputField.type === "checkbox" ? "change" : "input";
    inputField.addEventListener(eventType, () => showFieldError(inputField));
    inputField.addEventListener("blur", () => showFieldError(inputField));
  });

  if (fieldMap.password && fieldMap.confirmPassword) {
    fieldMap.password.addEventListener("input", () => {
      if (fieldMap.confirmPassword.value) showFieldError(fieldMap.confirmPassword);
    });
  }

  // ---------------------- Submit handling ----------------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    trackedFields.forEach((inputField) => showFieldError(inputField));

    const pwdVal = fieldMap.password?.value || "";
    const invalidFields = trackedFields.filter((f) => {
      const basicInvalid = !f.checkValidity();
      const isConfirm = f.name === "confirmPassword";
      const mismatch = isConfirm && f.value && f.value !== pwdVal;
      return basicInvalid || mismatch;
    });

    if (invalidFields.length > 0) {
      let title = "Please fix the errors below";

      const confirmField = invalidFields.find((field) => field.name === "confirmPassword");
      if (confirmField) {
        const pwd = fieldMap.password?.value || "";
        if (confirmField.value && confirmField.value !== pwd) {
          title = "Passwords do not match";
        } else if (!confirmField.value) {
          title = "Please confirm your password";
        }
      } else if (invalidFields.some((field) => !field.value.trim())) {
        title = "All fields are required";
      }

      await Swal.fire({
        icon: "error",
        title,
        confirmButtonText: "Okay, got it",
        allowOutsideClick: false,
        allowEscapeKey: true,
        customClass: {
          title: "swal-title",
          confirmButton: "swal-confirm-btn",
        },
      });
      invalidFields[0].focus();
      return;
    }

    const formData = {
      _csrf: form.querySelector('[name="_csrf"]').value,
      firstName: form.querySelector('[name="firstName"]').value,
      lastName: form.querySelector('[name="lastName"]').value,
      email: form.querySelector('[name="email"]').value,
      password: form.querySelector('[name="password"]').value,
    };

    if (!formData._csrf) {
      await Swal.fire({
        icon: "error",
        title: "Security error",
        text: "CSRF token is missing. Please refresh and try again.",
        confirmButtonText: "Okay",
      });
      return;
    }

    const submitBtn = document.getElementById("submit-button");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute("aria-busy", "true");
    }

    // -------------------- Fetch --------------------
    try {
      const response = await fetch("/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": formData._csrf,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(responseData.message || "Submission failed");
      }

      await Swal.fire({
        icon: "success",
        title: "Signup successful!",
        text: "Redirecting to 2FA...",
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      // ------------- Show Loading ------------
      LoadingOverlay.show();

      // ------------ Reset Form -----------
      form.reset();
      trackedFields.forEach(clearFieldError);

      // ------------ Redirect to 2FA page ------------
      window.location.href = "/two-factor";
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Submission failed",
        text: error.message || "An error occurred. Please try again.",
        confirmButtonText: "Try again",
      });
    } finally {
      LoadingOverlay.hide();

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.setAttribute("aria-busy", "false");
      }
    }
  });
});
