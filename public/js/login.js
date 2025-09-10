document.addEventListener("DOMContentLoaded", () => {
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

  function getErrorMessage(inputField) {
    const v = inputField.validity;
    const custom = messages[inputField.name] || {};
    if (v.valueMissing) return custom.valueMissing || "This field is required";
    if (v.typeMismatch)
      return custom.typeMismatch || "Please enter a valid value";
    if (v.tooShort)
      return custom.tooShort || `Min length is ${inputField.minLength}`;
    return inputField.validationMessage || "Please fix this field";
  }

  // ---------------------- Form & helpers ----------------------
  const form = document.getElementById("login-form");
  if (!form) return;

  // Grab the inputs we care about
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

  // Live validation: input/blur
  trackedFields.forEach((inputField) => {
    const eventType = inputField.type === "checkbox" ? "change" : "input";
    inputField.addEventListener(eventType, () => showFieldError(inputField));
    inputField.addEventListener("blur", () => showFieldError(inputField));
  });

  // Submit handling
  form.addEventListener("submit", (event) => {
    trackedFields.forEach((inputField) => showFieldError(inputField));

    if (!form.checkValidity()) {
      event.preventDefault();
      const firstInvalidField = form.querySelector(":invalid");
      if (firstInvalidField) firstInvalidField.focus();
      return;
    }

    // Optional: prevent double submits
    const submitButton = document.getElementById("submitBtn");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
    }
  });
});
