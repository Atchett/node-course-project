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

module.exports = router;
