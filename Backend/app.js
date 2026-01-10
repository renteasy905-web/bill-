import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import routes from "./routes.js";
// import extractRoute from "./routes/extract.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(multer().none());

// Routes
app.use("/api", routes);
// app.use("/api", extractRoute);

// Test route
app.get("/", (req, res) => {
  res.send("Backend running – Vishwas Medical Inventory API is live!");
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => {
    console.error("MongoDB error ❌:", err.message);
    process.exit(1);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
  console.log(`Visit: https://bill-inventory-backend.onrender.com`);
});
