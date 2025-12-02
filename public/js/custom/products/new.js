// public/js/custom/products/new.js

document.addEventListener("DOMContentLoaded", () => {
  // Initializes the Quill editor for product description
  var quill = new Quill("#kt_ecommerce_add_product_description", {
    theme: "snow",
    placeholder: "Type your description here...",
  });

  // Initialize Select2 for existing dropdowns
  const selectElements = document.querySelectorAll(".form-select");
  selectElements.forEach((selectElement) => {
    $(selectElement).select2({
      placeholder: "Select a variation",
    });
  });

  // Counter for unique naming
  let variationCounter = 1;

  // Function to initialize Select2 on a specific element
  function initializeSelect2(selectElement) {
    $(selectElement).select2({
      placeholder: "Select a variation",
    });
  }

  // Function to attach delete handler
  function attachDeleteHandler(deleteButton) {
    deleteButton.addEventListener("click", function () {
      const variationItem = deleteButton.closest("[data-repeater-item]");
      const variationContainer = document.querySelector(
        '[data-repeater-list="kt_ecommerce_add_product_options"]'
      );

      // Slide up animation
      $(variationItem).slideUp(300, function () {
        variationItem.remove();

        // If no variations left, we can optionally do something
        const remainingItems = variationContainer.querySelectorAll("[data-repeater-item]");
        if (remainingItems.length === 0) {
        }
      });
    });
  }

  // Handle adding new variation
  const addVariationButton = document.getElementById("add-variation");
  addVariationButton.addEventListener("click", () => {
    const variationContainer = document.querySelector(
      '[data-repeater-list="kt_ecommerce_add_product_options"]'
    );

    // Create a completely new variation item from scratch
    const newItem = document.createElement("div");
    newItem.setAttribute("data-repeater-item", "");
    newItem.className = "form-group d-flex flex-wrap align-items-center gap-5";
    newItem.style.display = "none";

    newItem.innerHTML = `
      <div class="w-100 w-md-200px">
        <select
          class="form-select"
          name="kt_ecommerce_add_product_options[${variationCounter}][product_option]"
          data-kt-ecommerce-catalog-add-product="product_option"
          data-placeholder="Select a variation"
        >
          <option></option>
          <option value="color">Color</option>
          <option value="size">Size</option>
          <option value="material">Material</option>
          <option value="style">Style</option>
        </select>
      </div>
      <input
        type="text"
        class="form-control mw-100 w-200px"
        name="kt_ecommerce_add_product_options[${variationCounter}][product_option_value]"
        placeholder="Variation"
      />
      <button
        type="button"
        class="btn btn-sm btn-icon btn-light-danger delete-variation"
      >
        <i class="ki-outline ki-cross fs-1"></i>
      </button>
    `;

    // Append the new item to the container
    variationContainer.appendChild(newItem);

    // Initialize Select2 on the new select element
    const newSelect = newItem.querySelector("select");
    initializeSelect2(newSelect);

    // Attach delete handler to the new delete button
    const newDeleteButton = newItem.querySelector(".delete-variation");
    attachDeleteHandler(newDeleteButton);

    // Slide down animation
    $(newItem).slideDown(300);

    // Increment counter for next item
    variationCounter++;
  });

  // Attach delete handlers to existing delete buttons
  const deleteButtons = document.querySelectorAll(".delete-variation");
  deleteButtons.forEach((button) => {
    attachDeleteHandler(button);
  });
});
