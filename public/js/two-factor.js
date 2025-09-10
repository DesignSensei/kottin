// public/js/two-factor.js
document.addEventListener("DOMContentLoaded", function () {
  var inputs = Array.prototype.slice.call(
    document.querySelectorAll(".otp-input")
  );
  var hidden = document.getElementById("otp-hidden-code");
  var form = document.getElementById("two-factor-form");
  var resendBtn = document.querySelector(
    "button[formaction='/two-factor/resend']"
  );

  // Focus first empty input (fallback to first)
  var target = null;
  for (var i = 0; i < inputs.length; i++) {
    if (!inputs[i].value) {
      target = inputs[i];
      break;
    }
  }
  if (!target && inputs.length) target = inputs[0];
  if (target) target.focus();

  inputs.forEach(function (input, index) {
    // Only 1 digit per box
    input.addEventListener("input", function () {
      var m = input.value.match(/\d/);
      input.value = m ? m[0] : "";
      if (input.value && inputs[index + 1]) inputs[index + 1].focus();
    });

    // Backspace moves left if empty
    input.addEventListener("keydown", function (e) {
      if (e.key === "Backspace" && !input.value && inputs[index - 1]) {
        inputs[index - 1].focus();
      }
    });

    // Paste support: fill all boxes
    input.addEventListener("paste", function (e) {
      e.preventDefault();
      var raw = (e.clipboardData || window.clipboardData).getData("text") || "";
      var digits = raw.replace(/\D/g, "").slice(0, inputs.length);
      for (var j = 0; j < digits.length; j++) inputs[j].value = digits[j];
      // Focus next empty or last
      var next = null;
      for (var k = 0; k < inputs.length; k++) {
        if (!inputs[k].value) {
          next = inputs[k];
          break;
        }
      }
      if (!next && inputs.length) next = inputs[inputs.length - 1];
      if (next) next.focus();
    });
  });

  // Join digits into hidden "code" BEFORE submit (and sanitize)
  if (form && hidden) {
    form.addEventListener("submit", function (e) {
      var code = inputs
        .map(function (i) {
          return i.value;
        })
        .join("")
        .replace(/\D/g, "")
        .slice(0, 6);
      if (code.length !== 6) {
        e.preventDefault();
        alert("Please enter all 6 digits.");
        return;
      }
      hidden.value = code; // controller reads req.body.code
    });
  }

  // Optional resend cooldown UI
  if (resendBtn) {
    resendBtn.addEventListener("click", function () {
      var seconds = 30;
      var originalText = resendBtn.textContent;
      resendBtn.disabled = true;
      var id = setInterval(function () {
        seconds--;
        resendBtn.textContent = "Resend (" + seconds + "s)";
        if (seconds <= 0) {
          clearInterval(id);
          resendBtn.textContent = originalText;
          resendBtn.disabled = false;
        }
      }, 1000);
    });
  }
});
