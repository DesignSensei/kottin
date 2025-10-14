// /js/vendor-ready.js

(function () {
  // Load script dynamically
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Load required vendor scripts if not already available
  async function ensureVendors() {
    const scripts = [];
    if (!window.axios)
      scripts.push(
        loadScript("https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js")
      );
    if (!window.Swal)
      scripts.push(loadScript("https://cdn.jsdelivr.net/npm/sweetalert2@11"));
    if (!window.feather)
      scripts.push(loadScript("https://unpkg.com/feather-icons"));
    await Promise.all(scripts);
  }

  // Expose globally
  window.ensureVendors = ensureVendors;

  // Start loading now & expose a promise
  window.vendorsReady = ensureVendors();

  // Run function when DOM is ready
  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  // Auto-run: load vendors and replace feather icons
  onReady(async () => {
    await ensureVendors();
    if (
      window.feather &&
      document.querySelector("[data-feather]") &&
      !window.__featherReplaced
    ) {
      window.feather.replace();
      window.__featherReplaced = true;
    }
  });
})();
