const path = require("path");
const express = require("express");
const { body } = require("express-validator");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

// /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

// /admin/add-product => GET
// /admin/add-product => POST
router.get("/add-product", isAuth, adminController.getAddProduct);
router.post(
  "/add-product",
  [
    body("title")
      .isString()
      .isLength({ min: 5 })
      .trim()
      .withMessage("Title must be 5 characters min"),
    body("price").isFloat().withMessage("Price must be a  number"),
    body("description")
      .isLength({ min: 10, max: 400 })
      .withMessage("Description can be between 10 and 400 characters"),
  ],
  isAuth,
  adminController.postAddProduct
);

// /admin/edit-product/8765342 => GET
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);
router.post(
  "/edit-product",
  [
    body("title")
      .isString()
      .isLength({ min: 5 })
      .trim()
      .withMessage("Title must be 5 characters min"),
    body("price").isFloat().withMessage("Price must be a  number"),
    body("description")
      .isLength({ min: 10, max: 400 })
      .withMessage("Description can be between 10 and 400 characters"),
  ],
  isAuth,
  adminController.postEditProduct
);

router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
