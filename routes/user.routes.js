

import express from "express";
import {
  checkAuth,
  loginUser,
  logout,
  registerUser,
  verifyUserOTP,
} from "../controller/user.controller.js";
import authUser from "../middlewares/authUser.js";
const router = express.Router();
router.post("/register", registerUser);
router.post("/verify-otp", verifyUserOTP);
router.post("/login", loginUser);
router.get("/is-auth", authUser, checkAuth);
router.get("/logout", authUser, logout);

export default router;
