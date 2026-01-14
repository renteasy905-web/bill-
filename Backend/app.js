const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();

// Import routes from same directory level
const routes = require("./routes");

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(multer().none());

// Mount all routes under /api
app.use("/api", routes);

// Root health check
app.get("/", (req, res) => {
  res.status(200).send("Backend running – Vishwas Medical Inventory API is live!");
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully ✅");
  })
  .catch((err) => {
    console.error("MongoDB connection failed ❌:", err.message);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 🚀`);
  console.log(`API URL: http://localhost:${PORT}/api`);
  console.log(`Live on Render: https://bill-inventory-backend.onrender.com`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down...");
  process.exit(0);
});
