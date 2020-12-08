const path = require("path");

const express = require("express");

const authController = require("../controllers/auth");

const router = express.Router();

// Login
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);

// Signup
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

// Logout
router.post("/logout", authController.postLogout);

// Password reset
router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.get("/reset/:resetToken", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);

module.exports = router;
