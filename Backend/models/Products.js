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
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

// IMPORTANT: Use capital "Product" here
module.exports = mongoose.model("Product", ProductSchema);
