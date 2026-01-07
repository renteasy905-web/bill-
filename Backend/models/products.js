const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
      trim: true
    },
    Description: {
      type: String,
      required: true,
      trim: true
    },
    Mrp: {
      type: Number,
      required: true,
      min: 0
    },
    Quantity: {
      type: Number,
      required: true,
      min: 0
    },
    Expiry: {
      type: Date, // ✅ VERY IMPORTANT
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("product", ProductSchema);
