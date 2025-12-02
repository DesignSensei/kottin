// controllers/admin/adminController.js

exports.showHome = (req, res) => {
  res.render("main/index", {
    layout: "layouts/shop-layout",
    title: "Home",
    wfPage: "66b93fd9c65755b8a91df148",
    scripts: "",
  });
};

exports.showDashboard = (req, res) => {
  res.render("admin/dashboard", {
    layout: "layouts/admin-layout",
    title: "Dashboard",
    pageTitle: "Dashboard",
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Dashboard", url: null },
    ],
    styles: `
    <!--begin::Vendor Stylesheets(used for this page only)-->
    <link href="/assets/plugins/custom/datatables/datatables.bundle.css" rel="stylesheet" type="text/css" />
    <link href="/assets/plugins/custom/vis-timeline/vis-timeline.bundle.css" rel="stylesheet" type="text/css" />
    <!--end::Vendor Stylesheets-->
    `,
    scripts: `
      <!--begin::Vendors Javascript(used for this page only)-->
    <script src="/assets/plugins/custom/datatables/datatables.bundle.js"></script>
    <script src="/assets/plugins/custom/vis-timeline/vis-timeline.bundle.js"></script>
    <!--end::Vendors Javascript-->
    
    <!--begin::Custom Javascript(used for this page only)-->
    <script src="/assets/js/widgets.bundle.js"></script>
    <script src="/assets/js/custom/widgets.js"></script>
    <script src="/assets/js/custom/custom-widgets/widget-1.js"></script>
    <script src="/assets/js/custom/custom-widgets/widget-2.js"></script>
    <script src="/assets/js/custom/apps/chat/chat.js"></script>
    <script src="/assets/js/custom/utilities/modals/upgrade-plan.js"></script>
    <script src="/assets/js/custom/utilities/modals/users-search.js"></script>
    <!--end::Custom Javascript-->
    `,
    showActivitiesDrawer: false,
    showChatDrawer1: false,
    showChatDrawer2: false,
  });
};
