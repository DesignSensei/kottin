// public/js/utils/loading.js

export const LoadingOverlay = {
  show() {
    const loadingHTML = `
      <div class="swal2-loading-overlay">
        <svg class="swal2-loading-spinner" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 2a17 17 0 1 0 0 34 17 17 0 0 0 0-34zm0 30a13 13 0 1 1 0-26 13 13 0 0 1 0 26z" opacity=".3"/>
          <path d="M19 2v6" stroke="#9f7aea" stroke-width="4" stroke-linecap="round"/>
        </svg>
        <p class="swal2-loading-text">Loading...</p>
      </div>`;

    Swal.fire({
      html: loadingHTML,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      customClass: { popup: "swal2-no-padding" },
    });
  },

  hide() {
    if (Swal.isVisible()) {
      Swal.close();
    }
  },
};
