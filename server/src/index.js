import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";
import uploadRoutes from "./routes/upload.js";
import { seedProducts } from "./seed.js";

const app = express();
const PORT = process.env.PORT || 5000;

let MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI && process.env.DB_USER && process.env.DB_PASSWORD) {
  MONGODB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0lm.sub17tf.mongodb.net/restaurant_shop?appName=Cluster0LM`;
} else if (!MONGODB_URI) {
  MONGODB_URI = "mongodb://127.0.0.1:27017/restaurant_shop";
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/uploads", express.static("uploads"));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// Middleware to check database connectivity and prevent hanging requests
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database connection is not established. If you are using MongoDB Atlas, please check if your current IP address is whitelisted in your Atlas account (Security -> Network Access). If you are running locally, make sure MongoDB is installed and running."
    });
  }
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

// Connect to MongoDB immediately
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
  .then(() => seedProducts())
  .catch((e) => console.error("Database connection error:", e));

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

export default app;










