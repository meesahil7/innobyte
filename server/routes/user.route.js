const express = require("express");
const { authenticate } = require("../middlewares/authenticate.middleware");
const {
  getUserData,
  updateUserData,
} = require("../controllers/user.controller");

const userRouter = express.Router();

userRouter.get("/profile", authenticate, getUserData);

userRouter.patch("/profile/update", authenticate, updateUserData);

module.exports = { userRouter };
