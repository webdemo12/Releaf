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
// You can set ALLOWED_ORIGINS as a comma-separated env var, or CLIENT_URL for a single origin.
const rawAllowed = process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || "http://localhost:5173";
const allowedOrigins = rawAllowed.split(",").map((s) => s.trim()).filter(Boolean);
const isDev = process.env.NODE_ENV !== "production";

// Simple request logger to help debug CORS/network issues
app.use((req, res, next) => {
  console.log("Incoming ->", req.method, req.url, "Origin:", req.headers.origin || "<no-origin>");
  next();
});

// Use a dynamic origin function so the Access-Control-Allow-Origin header
// reflects the request origin (keeps credentials working). In development
// we allow any origin to make debugging easier — tighten this for production.
app.use(
  cors({
    origin: (origin, callback) => {
      console.log("CORS origin check:", origin);
      // allow requests with no origin like curl or server-to-server
      if (!origin) return callback(null, true);
      // during development accept any origin
      if (isDev) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS policy does not allow access from this origin."));
    },
    credentials: true,
  })
);

// Simple error handler to log CORS or other errors during requests
app.use((err, req, res, next) => {
  if (err) {
    console.error("Error handler:", err.message);
    // for CORS errors, the preflight will fail — send a small JSON response
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  next();
});
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
