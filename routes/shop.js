const express = require("express");

const shopController = require("../controllers/shop");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

// index
router.get("/", shopController.getIndex);

// product
router.get("/products", shopController.getProducts);
router.get("/products/:productId", shopController.getProduct);

// cart
router.get("/cart", isAuth, shopController.getCart);
router.post("/cart", isAuth, shopController.postCart);
router.post("/cart-delete-item", isAuth, shopController.postCartDeleteProduct);

// order
router.get("/orders", isAuth, shopController.getOrders);
//router.post("/create-order", isAuth, shopController.postOrder);
router.get("/orders/:orderId", isAuth, shopController.getInvoice);

// checkout
router.get("/checkout", isAuth, shopController.getCheckout);
router.get("/checkout/success", isAuth, shopController.getCheckoutSuccess);
router.get("/checkout/cancel", isAuth, shopController.getCheckout);

module.exports = router;
