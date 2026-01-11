// models/sale.js   (o wherever your Sale model is defined)
const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false,          // ← CHANGED: Now optional for regular/walk-in sales
      default: null             // Optional: null means "Walk-in" or regular
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        price: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ],
    totalAmount: {
      type: Number,
      required: true
    },
    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Card"],
      default: "Cash"
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Optional: Add a virtual field to show "Regular" or customer name in frontend
saleSchema.virtual("customerName").get(function () {
  return this.customer ? "Registered Customer" : "Regular / Walk-in";
});

module.exports = mongoose.model("Sale", saleSchema);
