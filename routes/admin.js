const express = require("express");
const router = express.Router();
const {
  createUser,
  loginUser,
  forgetPassword,
  resetPassword,
} = require("../controllers/adminController");

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/auth/forget-password", forgetPassword);
router.post("/auth/reset-password/:token", resetPassword);

module.exports = router;
