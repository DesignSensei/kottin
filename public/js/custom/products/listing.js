// public/js/products/listing.js

document.addEventListener("DOMContentLoaded", function () {
  const productTable = document.getElementById("productTable");
  // Initialize DataTables with vanilla JS (assuming DataTables is still being used)
  const dataTable = new DataTable(productTable, {
    info: false,
    ajax: {
      url: "/admin/api/products",
      dataSrc: function (json) {
        return json.products;
      },
      data: function (d) {
        const searchQuery = document.getElementById("searchProduct").value.trim();
        const statusFilterValue = document.getElementById("statusFilter").value;

        d.search = searchQuery;
        d.status = statusFilterValue;

        const page =
          d.start !== undefined && d.length !== undefined ? Math.ceil(d.start / d.length) + 1 : 1;
        d.page = page;
        d.pageSize = d.length;
      },
    },
    searching: true,
    paging: true,
    ordering: true,
    order: [],
    columnDefs: [{ targets: [0, 6], orderable: false }],
    lengthMenu: [10, 25, 50, 100],
    pageLength: 10,
    language: {
      emptyTable:
        '<div style="text-align: center; font-weight: 600; font-size: 1.1rem; padding: 2rem;">No products yet.</div>',
      zeroRecords:
        '<div style="text-align: center; font-weight: 600; font-size: 1.1rem; padding: 2rem;">No matching products found.</div>',
    },
    columns: [
      { data: "checkbox" },
      { data: "name" },
      { data: "categories" },
      { data: "quantity" },
      { data: "price" },
      { data: "status" },
      { data: "actions" },
    ],
  });

  // Search Input Handler (using vanilla JS)
  const searchInput = document.getElementById("searchProduct");
  searchInput.addEventListener("input", function () {
    dataTable.search(this.value).draw();
  });

  // Status Filter Change Handler
  const statusFilter = document.getElementById("statusFilter");
  statusFilter.addEventListener("change", function () {
    dataTable.draw();
  });

  // Select All Checkboxes
  const selectAllCheckbox = document.getElementById("selectAll");
  selectAllCheckbox.addEventListener("change", function () {
    const isChecked = this.checked;
    const checkboxes = document.querySelectorAll(".product-checkbox");
    checkboxes.forEach((checkbox) => (checkbox.checked = isChecked));
  });
});
