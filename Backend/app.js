const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();
const routes = require("./routes"); // Existing routes
// const extractRoute = require("./routes/extract"); // Temporarily disabled - file missing
const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
// Multer setup (for file uploads)
app.use(multer().none()); // Allow multipart/form-data

// Routes
app.use("/api", routes);
// app.use("/api", extractRoute); // Temporarily disabled - file missing

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
