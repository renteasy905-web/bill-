const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const routes = require("./routes"); // Make sure this path is correct

const app = express();

// Middleware
app.use(cors({ origin: "*" })); // Allows your frontend (and others) – change to specific URL in production
app.use(express.json());

// API Routes – all routes in routes.js will be under /api
app.use("/api", routes);

// Test route – to check if backend is running
app.get("/", (req, res) => {
  res.send("Backend running – Vishwas Medical Inventory API is live!");
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully ✅");
  })
  .catch((err) => {
    console.error("MongoDB connection error ❌:", err.message);
    process.exit(1); // Stop server if DB fails to connect
  });

// Port setup
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
  console.log(`Visit: https://bill-inventory-backend.onrender.com`);
});
