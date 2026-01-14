const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();

const routes = require("./routes");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(multer().none());

app.use("/api", routes);

app.get("/", (req, res) => {
  res.status(200).send("Backend running – Vishwas Medical Inventory API is live!");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully ✅"))
  .catch((err) => {
    console.error("MongoDB connection failed ❌:", err.message);
    process.exit(1);
  });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 🚀`);
  console.log(`API URL: http://localhost:${PORT}/api`);
  console.log(`Live on Render: https://bill-inventory-backend.onrender.com`);
});

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
