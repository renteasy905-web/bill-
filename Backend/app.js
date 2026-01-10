const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();

const routes = require("./routes");
// const extractRoute = require("./routes/extract");

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(multer().none());

// Routes
app.use("/api", routes);
// app.use("/api", extractRoute);

app.get("/", (req, res) => {
  res.send("Backend running – Vishwas Medical Inventory API is live!");
});

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
