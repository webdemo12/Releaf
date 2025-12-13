import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Seller from "../models/seller.model.js";
import OTP from "../models/otp.model.js";
import { sendOTP } from "../utils/emailService.js";

// seller login :/api/seller/login
export const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res
        .status(400)
        .json({ message: "Seller not found", success: false });
    }
    const isPasswordValid = await bcrypt.compare(password, seller.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("sellerToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res
      .status(200)
      .json({ message: "Login successful", success: true });
  } catch (error) {
    console.error("Error in sellerLogin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// register seller: /api/seller/register
export const registerSeller = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill all the fields", success: false });
    }

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res
        .status(409)
        .json({ message: "Seller already exists. Please login instead.", success: false });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP for seller:", { email, otp: "***", type: "seller" });

    // Save OTP
    await OTP.create({ email, otp, type: "seller" });
    console.log("OTP saved to database");

    // Send OTP
    await sendOTP(email, otp, "Seller");
    console.log("OTP sent successfully");

    res.status(200).json({
      message: "OTP sent to your email. Please verify to complete registration.",
      success: true,
    });
  } catch (error) {
    console.error("Error in registerSeller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// verify seller OTP: /api/seller/verify-otp
export const verifySellerOTP = async (req, res) => {
  try {
    const { email, otp, password, name, businessName } = req.body;
    console.log("verifySellerOTP request body:", { email, otp: otp ? "***" : undefined, password: password ? "***" : undefined, name, businessName });

    if (!email || !otp || !password || !name || !businessName) {
      console.log("Missing fields in verifySellerOTP:", { email: !!email, otp: !!otp, password: !!password, name: !!name, businessName: !!businessName });
      return res
        .status(400)
        .json({ message: "Please fill all the fields", success: false });
    }

    const otpRecord = await OTP.findOne({ email, otp, type: "seller" });
    console.log("OTP record found:", !!otpRecord);
    if (!otpRecord) {
      console.log("No OTP record found for:", { email, otp: "***", type: "seller" });
      return res
        .status(400)
        .json({ message: "Invalid or expired OTP", success: false });
    }

    // Delete OTP
    await OTP.deleteOne({ _id: otpRecord._id });
    console.log("OTP deleted successfully");

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    console.log("Existing seller check:", !!existingSeller);
    if (existingSeller) {
      return res
        .status(400)
        .json({ message: "Seller already exists", success: false });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create seller
    const seller = new Seller({
      name,
      email,
      password: hashedPassword,
      businessName,
    });
    await seller.save();
    console.log("Seller created successfully:", seller._id);

    res.status(201).json({
      message: "Seller registered successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in verifySellerOTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// check seller auth  : /api/seller/is-auth
export const checkAuth = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      seller: req.seller,
    });
  } catch (error) {
    console.error("Error in checkAuth:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// logout seller: /api/seller/logout
export const sellerLogout = async (req, res) => {
  try {
    res.clearCookie("sellerToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
    });
    return res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
