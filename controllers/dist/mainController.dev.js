"use strict";

// controllers/mainController.js
exports.showHome = function (req, res) {
  res.render("main/index", {
    layout: "layouts/shop-layout",
    title: "Home",
    wfPage: "66b93fd9c65755b8a91df148",
    scripts: ""
  });
};

exports.showDashboard = function (req, res) {
  res.render("webapp/dashboard", {
    layout: "layouts/main-layout",
    title: "Dashboard",
    pageTitle: "Dashboard",
    breadcrumbs: [{
      name: "Home",
      url: "/"
    }, {
      name: "Dashboard",
      url: null
    }],
    styles: "\n    <!--begin::Vendor Stylesheets(used for this page only)-->\n    <link href=\"/assets/plugins/custom/datatables/datatables.bundle.css\" rel=\"stylesheet\" type=\"text/css\" />\n    <link href=\"/assets/plugins/custom/vis-timeline/vis-timeline.bundle.css\" rel=\"stylesheet\" type=\"text/css\" />\n    <!--end::Vendor Stylesheets-->\n    ",
    scripts: "\n      <!--begin::Vendors Javascript(used for this page only)-->\n    <script src=\"/assets/plugins/custom/datatables/datatables.bundle.js\"></script>\n    <script src=\"/assets/plugins/custom/vis-timeline/vis-timeline.bundle.js\"></script>\n    <!--end::Vendors Javascript-->\n    \n    <!--begin::Custom Javascript(used for this page only)-->\n    <script src=\"/assets/js/widgets.bundle.js\"></script>\n    <script src=\"/assets/js/custom/widgets.js\"></script>\n    <script src=\"/assets/js/custom/custom-widgets/widget-1.js\"></script>\n    <script src=\"/assets/js/custom/custom-widgets/widget-2.js\"></script>\n    <script src=\"/assets/js/custom/apps/chat/chat.js\"></script>\n    <script src=\"/assets/js/custom/utilities/modals/upgrade-plan.js\"></script>\n    <script src=\"/assets/js/custom/utilities/modals/users-search.js\"></script>\n    <!--end::Custom Javascript-->\n    "
  });
};