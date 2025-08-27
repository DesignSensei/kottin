// public/js/two-factor.js

document.addEventListener("DOMContentLoaded", () => {
  const inputs = Array.from(document.querySelectorAll(".otp-input"));
  const hidden = document.getElementById("otp-hidden-code");
  const form = document.getElementById("two-factor-form");
  const resendBtn = document.getElementById(
    "button[formaction='two-factor/resend']"
  );

  // Focus first empty input
  const target = inputs.find((i) => !i.value) ?? inputs[0];
  if (target) target.focus();

  inputs.forEach((input, index) => {
    // When you type a digit, auto‑move to the next box
    input.addEventListener("input", () => {
      input.value = (input.value.match(/\d/) || [""])[0];
      if (input.value && inputs[index + 1]) {
        inputs[index + 1].focus();
      }
    });

    // On backspace in an empty box, go back
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && inputs[index - 1]) {
        inputs[index - 1].focus();
      }
    });

    // Handle paste & fills all boxes
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const raw =
        (e.clipboardData || window.clipboardData).getData("text") || "";
      const digits = raw.replace(/\D/g, "").slice(0, inputs.length);

      for (let i = 0; i < digits.length; i++) {
        inputs[i].value = digits[i];
      }

      const target = inputs.find((i) => !i.value) ?? inputs.at(-1);
      target?.focus();
    });

    // Join digits into hidden "code" before submit
    if (form && hidden) {
      form.addEventListener("submit", () => {
        code = inputs.map((i) => i.value).join("");
        if (code.length !== 6) {
          e.preventDefault();
          Swal.fire({
            icon: "warning",
            title: "Incomplete code",
            text: "Please enter all 6 digits before verifying.",
          });
          return;
        }
        hidden.value = code;
      });
    }

    // Handle Resend button cooldown
    if (resendBtn) {
      resendBtn.addEventListener("click", () => {
        let seconds = 30;
        resendBtn.disabled = true;
        const originalText = resendBtn.textContent;

        const interval = setInterval(() => {
          seconds--;
          resendBtn.textContent = `Resend (${seconds}s)`;
          if (seconds <= 0) {
            clearInterval(interval);
            resendBtn.textContent = originalText;
            resendBtn.disabled = false;
          }
        }, 1000);
      });
    }
  });
});
