const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const routes = require("./routes");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// API routes
app.use("/api", routes);

// test route
app.get("/", (req, res) => {
  res.send("Backend running");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Mongo error:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
