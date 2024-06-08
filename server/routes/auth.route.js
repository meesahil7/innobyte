const express = require("express");
const {
  signup,
  login,
  logout,
  verifyEmail,
  verifyLogin,
  resendOtp,
} = require("../controllers/auth.controller");

const authRouter = express.Router();

authRouter.post("/signup", signup);

authRouter.post("/verifyEmail/:id", verifyEmail);

authRouter.post("/login", login);

authRouter.post("/verifyLogin/:id", verifyLogin);

authRouter.post("/resendOtp/:id", resendOtp);

authRouter.post("/logout", logout);

module.exports = { authRouter };
