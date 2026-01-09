const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",           // ← Change to capital "C" (assuming customer model uses "Customer")
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",        // ← Change to capital "P" — must match above
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
    // Very important for reminders (1 month ago logic)
    date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// IMPORTANT: Use capital "Sale" (singular) — standard convention
module.exports = mongoose.model("Sale", saleSchema);
