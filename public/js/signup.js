// public/js/signup.js

document.addEventListener("DOMContentLoaded", () => {
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
    toggleBtn.innerHTML = feather.icons["eye-off"].toSvg();

    toggleBtn.addEventListener("click", () => {
      visible = !visible;
      passwordInput.type = visible ? "text" : "password";
      toggleBtn.innerHTML = feather.icons[visible ? "eye" : "eye-off"].toSvg();
      toggleBtn.setAttribute(
        "aria-label",
        visible ? "Hide password" : "Show password"
      );
    });
  });

  // ---------------------- Validation Messages ----------------------
  const messages = {
    firstName: { valueMissing: "First name is required." },

    lastName: { valueMissing: "Last name is required." },

    email: {
      valueMissing: "Email is required.",
      typeMismatch: "Enter a valid email address.",
    },

    password: {
      valueMissing: "Password is required.",
      tooShort: "Password must be at least 8 characters.",
    },

    confirmPassword: {
      valueMissing: "Please confirm your password.",
      mismatch: "Passwords do not match.",
    },

    agree: { valueMissing: "You must agree to the Terms and Privacy Policy." },
  };

  function getErrorMessage(field) {
    const validity = field.validity;
    const customMessages = messages[field.name] || {};

    if (validity.valueMissing)
      return customMessages.valueMissing || "This field is required";

    if (validity.typeMismatch)
      return customMessages.typeMismatch || "Please enter a valid value";

    if (validity.tooShort)
      return customMessages.tooShort || `Mininum length is ${field.minLength}`;

    return field.validationMessage || "Please fix this field";
  }

  // ---------------------- Form & fields ----------------------
  const form = document.getElementById("signup-form");
  if (!form) return;

  const fields = [
    "firstName",
    "lastName",
    "email",
    "password",
    "confirmPassword",
    "agree",
  ]
    .map((name) => form.querySelector(`[name="${name}"]`))
    .filter(Boolean);

  // ---------------------- Helpers ----------------------
  function setAriaInvalid(field, isInvalid) {
    field.setAttribute("aria-invalid", isInvalid ? "true" : "false");
  }

  function getErrorContainer(field) {
    return form.querySelector(`.field-error[data-for="${field.name}"]`);
  }

  function clearFieldError(field) {
    const container = getErrorContainer(field);
    if (container) container.textContent = "";
    field.classList.remove("input-error", "is-invalid");
    setAriaInvalid(field, false);
  }

  function showFieldError(field) {
    const container = getErrorContainer(field);
    if (!container) return;

    // Built-in validity
    const builtInValid = field.checkValidity();

    // Extra check for confirmPassword
    let mismatch = false;
    if (field.name === "confirmPassword") {
      const pw = form.querySelector('[name="password"]');
      mismatch = !!(pw && field.value && field.value !== pw.value);
    }

    if (!builtInValid || mismatch) {
      container.textContent = getErrorMessage(field, form);
      field.classList.add("input-error", "is-invalid");
      setAriaInvalid(field, true);
    } else {
      clearFieldError(field);
    }
  }

  // ---------------------- Live validation ----------------------
  fields.forEach((field) => {
    const eventType = field.type === "checkbox" ? "change" : "input";
    field.addEventListener(eventType, () => showFieldError(field));
    field.addEventListener("blur", () => showFieldError(field));
  });

  // Keep confirmPassword in sync if password changes
  if (password && confirmPassword) {
    password.addEventListener("input", () => {
      if (confirmPassword.value) showFieldError(confirmPassword);
    });
  }

  // ---------------------- Submit handling ----------------------
  form.addEventListener("submit", (e) => {
    fields.forEach((field) => showFieldError(field));

    if (!form.checkValidity()) {
      e.preventDefault();
      const firstInvalid =
        form.querySelector(":invalid") || form.querySelector(".is-invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Prevent double submit
    const submitBtn = document.getElementById("primary-button");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute("aria-busy", "true");
    }
  });
});
