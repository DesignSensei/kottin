// public/js/i.js

function iceCream() {
  const icedCream = document.querySelector(".w-webflow-badge");
  if (icedCream) {
    icedCream.remove();
    return true;
  }
  return false;
}

document.addEventListener("DOMContentLoaded", () => {
  // Run iceCream immediately
  iceCream();

  // Run iceCream with staggered delays (in case badge loads late)
  [25, 50, 100, 200, 300, 400, 500, 600, 700, 1000].forEach((delay) => {
    setTimeout(iceCream, delay);
  });

  // Logout Handler
  const logoutBtn = document.getElementById("logout-button");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await fetch("/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }

    // Always redirect to /shop after logout attempt
    window.location.href = "/home";
  });
});
