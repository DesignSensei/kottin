document.addEventListener("DOMContentLoaded", () => {
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

  // Form Validation Messages
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
      return customMessages.tooShort || `Min length is ${field.minLength}`;

    return field.validationMessage || "Please fix this field";
  }
});
