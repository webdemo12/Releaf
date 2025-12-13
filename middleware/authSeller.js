import jwt from "jsonwebtoken";
import Seller from "../models/seller.model.js";

export const authSeller = async (req, res, next) => {
  const { sellerToken } = req.cookies;
  if (!sellerToken) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }
  try {
    const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET);
    const seller = await Seller.findOne({ email: decoded.email });
    if (seller) {
      req.seller = seller;
      return next();
    } else {
      return res.status(403).json({ message: "Seller not found", success: false });
    }
  } catch (error) {
    console.error("Error in authSeller middleware:", error);
    return res.status(401).json({ message: "Invalid token", success: false });
  }
};
