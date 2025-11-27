// public/js/custom/auth/two-factor.js

document.addEventListener("DOMContentLoaded", () => {
  const inputs = Array.from(document.querySelectorAll(".otp-input"));
  const hidden = document.getElementById("otp-hidden-code");
  const form = document.getElementById("two-factor-form");
  const resendBtn = document.getElementById("resend-btn");

  // Focus first empty input (fallback to first)
  let target = inputs.find((input) => !input.value);
  if (!target && inputs.length > 0) target = inputs[0];
  if (target) target.focus();

  // Input Behavior
  inputs.forEach((input, index) => {
    // Allow only 1 digit
    input.addEventListener("input", () => {
      const digit = input.value.match(/\d/)?.[0] || "";
      input.value = digit;
      if (digit && inputs[index + 1]) {
        inputs[index + 1].focus();
      }
    });

    // Backspace moves left if empty
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    });

    // Paste support: fill all boxes
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const paste = (e.clipboardData || window.clipboardData).getData("text");
      const digits = paste.replace(/\D/g, "").slice(0, 6);

      digits.split("").forEach((digit, index) => {
        if (inputs[index]) inputs[index].value = digit;
      });

      let nextEmpty = inputs.find((input) => !input.value);
      if (!nextEmpty) nextEmpty = inputs[inputs.length - 1];
      nextEmpty?.focus();
    });
  });

  // Join digits into hidden "code" BEFORE submit (and sanitize)
  if (form && hidden) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const code = inputs
        .map((input) => input.value)
        .join("")
        .replace(/\D/g, "");

      if (code.length !== 6) {
        await Swal.fire({
          icon: "error",
          title: "Invalid Code",
          text: "Please enter all 6 digits",
          confirmButtonColor: "#d25782",
        });
        inputs.find((input) => !input.value)?.focus();
        return;
      }

      hidden.value = code;

      // Disable submit button
      const submitButton = document.getElementById("primary-button");
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
      }

      try {
        // Submit via fetch to get JSON response
        const response = await fetch("/two-factor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": document.querySelector("input[name='_csrf']").value,
          },
          credentials: "same-origin",
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Invalid code");
        }

        // Success shows message and redirects
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: data.message || "2FA complete!",
          timer: 1500,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: true,
        });

        window.location.href = data.redirect || "/home";
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Verification Failed",
          text: error.message || "Something went wrong!",
          confirmButtonText: "Try Again",
        });
        // Re-focus first input
        if (inputs[0]) inputs[0].focus();
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.setAttribute("aria-busy", "false");
        }
      }
    });
  }

  // Optional resend cooldown UI
  if (resendBtn) {
    let isCoolingDown = false;

    resendBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (isCoolingDown) return;

      isCoolingDown = true;
      resendBtn.disabled = true;
      const originalText = resendBtn.textContent.trim();
      let seconds = 30;

      resendBtn.textContent = `Resend (${seconds}s)`;

      try {
        const response = await fetch("/two-factor/resend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": document.querySelector("input[name='_csrf']").value,
          },
        });

        if (response.ok) {
          await Swal.fire({
            icon: "success",
            title: "Sent!",
            text: "A new code has been sent to your email.",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          throw new Error();
        }
      } catch (err) {
        await Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Could not resend code. Try again.",
        });
      }

      // Cooldown timer
      const timer = setInterval(() => {
        seconds--;
        resendBtn.textContent = `Resend (${seconds}s)`;
        if (seconds <= 0) {
          clearInterval(timer);
          resendBtn.textContent = originalText;
          resendBtn.disabled = false;
          isCoolingDown = false;
        }
      }, 1000);
    });
  }
});
