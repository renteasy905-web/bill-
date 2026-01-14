const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();

const routes = require("./routes"); // correct path from app.js

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(multer().none());

// Routes
app.use("/api", routes);

// Health check
app.get("/", (req, res) => {
  res.status(200).send("Backend running – Vishwas Medical Inventory API is live!");
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully ✅"))
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
