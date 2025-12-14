import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/connectDB.js";
dotenv.config();
import userRoutes from "./routes/user.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import addressRoutes from "./routes/address.routes.js";
import orderRoutes from "./routes/order.routes.js";

import { connectCloudinary } from "./config/cloudinary.js";

const app = express();

await connectCloudinary();
// allow browser origin dynamically (use a stricter list in production)
// For development you can set CLIENT_URL in your environment to restrict origins.
const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:5173"];
// Use a dynamic origin function so the Access-Control-Allow-Origin header
// reflects the request origin (keeps credentials working).
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin like curl or server-to-server
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // In development it's convenient to allow any origin. If you want
      // to allow all origins, replace the above check with `callback(null, true)`.
      return callback(new Error("CORS policy does not allow access from this origin."));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Api endpoints
app.use("/images", express.static("uploads"));
app.use("/api/user", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
