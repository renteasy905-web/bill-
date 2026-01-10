// app.js - Main entry point for Vishwas Medical Inventory & Billing Backend

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();

// Import routes
const routes = require("./routes");

// Initialize Express app
const app = express();

// =====================
// MIDDLEWARE
// =====================

// Enable CORS for all origins (you can restrict later)
app.use(cors({ origin: "*" }));

// Parse JSON request bodies
app.use(express.json());

// Disable multipart/form-data parsing (we don't need file uploads here)
app.use(multer().none());

// =====================
// ROUTES
// =====================

// Mount all API routes under /api
app.use("/api", routes);

// Root route - simple health check
app.get("/", (req, res) => {
  res.status(200).send("Backend running – Vishwas Medical Inventory API is live!");
});

// =====================
// DATABASE CONNECTION
// =====================
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected successfully ✅");
  })
  .catch((err) => {
    console.error("MongoDB connection failed ❌:", err.message);
    process.exit(1); // Exit if DB connection fails
  });

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 🚀`);
  console.log(`API URL: http://localhost:${PORT}/api`);
  console.log(`Health check: http://localhost:${PORT}/`);
  console.log(`Live on Render: https://bill-inventory-backend.onrender.com`);
});

// Optional: Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  process.exit(0);
});
