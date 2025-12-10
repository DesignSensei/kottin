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
      const response = await fetch("/logout", {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();

      // Check if logout was successful
      if (result.success) {
        // Redirect based on role
        if (result.role === "super-admin" || result.role === "admin") {
          window.location.replace("/login");
        } else {
          window.location.replace("/shop");
        }
      } else {
        console.error("Logout failed:", result.message);
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  });
});
