"use strict";

// /js/vendor-ready.js
(function () {
  // Load script dynamically
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  } // Load required vendor scripts if not already available


  function ensureVendors() {
    var scripts;
    return regeneratorRuntime.async(function ensureVendors$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            scripts = [];
            if (!window.axios) scripts.push(loadScript("https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"));
            if (!window.Swal) scripts.push(loadScript("https://cdn.jsdelivr.net/npm/sweetalert2@11"));
            if (!window.feather) scripts.push(loadScript("https://unpkg.com/feather-icons"));
            _context.next = 6;
            return regeneratorRuntime.awrap(Promise.all(scripts));

          case 6:
          case "end":
            return _context.stop();
        }
      }
    });
  } // Expose globally


  window.ensureVendors = ensureVendors; // Start loading now & expose a promise

  window.vendorsReady = ensureVendors(); // Run function when DOM is ready

  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  } // Auto-run: load vendors and replace feather icons


  onReady(function _callee() {
    return regeneratorRuntime.async(function _callee$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return regeneratorRuntime.awrap(ensureVendors());

          case 2:
            if (window.feather && document.querySelector("[data-feather]") && !window.__featherReplaced) {
              window.feather.replace();
              window.__featherReplaced = true;
            }

          case 3:
          case "end":
            return _context2.stop();
        }
      }
    });
  });
})();