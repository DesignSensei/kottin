// controllers/shopController.js

exports.showShop = (req, res) => {
  res.render("shop/index", {
    layout: "layouts/shop-layout",
    title: "Shop",
    wfPage: "66ba7df56163a72359b4697d",
    scripts: "",
  });
};
