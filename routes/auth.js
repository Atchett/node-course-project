const path = require("path");
const { check, body } = require("express-validator");
const express = require("express");

const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

// Login
router.get("/login", authController.getLogin);
router.post(
  "/login",
  check("email")
    .isEmail()
    .withMessage("Email address is invalid")
    .normalizeEmail(),
  authController.postLogin
);

// Signup
router.get("/signup", authController.getSignup);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Email address is invalid")
      .normalizeEmail()
      .custom((value, { req }) => {
        // if (value === "test@test.com") {
        //   throw new Error("Forbidden email address");
        // }
        // return true;
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email exists. Try another.");
          }
        });
      }),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password length must be at least 5 characters"),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
  ],
  authController.postSignup
);

// Logout
router.post("/logout", authController.postLogout);

// Password reset
router.get("/reset", authController.getReset);
router.post(
  "/reset",
  check("email")
    .isEmail()
    .withMessage("Email address is invalid")
    .normalizeEmail(),
  authController.postReset
);
router.get("/reset/:resetToken", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);

module.exports = router;
