import express from "express";
import {
  checkAuth,
  sellerLogin,
  sellerLogout,
  registerSeller,
  verifySellerOTP,
} from "../controller/seller.controller.js";
import { authSeller } from "../middlewares/authSeller.js";
const router = express.Router();

router.post("/register", registerSeller);
router.post("/verify-otp", verifySellerOTP);
router.post("/login", sellerLogin);
router.get("/is-auth", authSeller, checkAuth);
router.get("/logout", authSeller, sellerLogout);

export default router;
