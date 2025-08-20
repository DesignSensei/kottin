document.addEventListener("DOMContentLoaded", () => {
  // Password toggle
  const password = document.getElementById("password");
  const toggle = document.getElementById("togglePassword");

  if (password && toggle) {
    let visible = false;

    toggle.innerHTML = feather.icons["eye-off"].toSvg();
    toggle.addEventListener("click", () => {
      visible = !visible;
      password.type = visible ? "text" : "password";
      toggle.innerHTML = feather.icons[visible ? "eye" : "eye-off"].toSvg();
      toggle.setAttribute(
        "aria-label",
        visible ? "Hide password" : "Show password"
      );
    });
  }

  // Form Validation Messages
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
      return customMessages.tooShort || `Min length is ${field.minLength}`;

    return field.validationMessage || "Please fix this field";
  }

  // Form submit + SweetAlert
  const form = document.getElementById("auth-form");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Clear out old hints & error styles
      form.querySelectorAll(".hint").forEach((h) => h.remove());
      form
        .querySelectorAll(".input-error")
        .forEach((f) => f.classList.remove("input-error"));

      if (!form.checkValidity()) {
        // Add hints under every invalid field
        form.querySelectorAll(":invalid").forEach((field) => {
          field.classList.add("input-error");

          // Create hint
          const hint = document.createElement("div");
          hint.className = "hint";
          hint.textContent = getErrorMessage(field);

          // Place hint right under the input
          field.insertAdjacentElement("afterend", hint);
        });

        // Grab the first invalid field and nudge the user with SweetAlert
        const firstInvalid = form.querySelector(":invalid");
        Swal.fire({
          icon: "warning",
          text: getErrorMessage(firstInvalid),
          confirmButtonColor: "#D25782",
        }).then(() => firstInvalid.focus());

        return;
      }

      form.submit();
    });
  }
});
