const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",           // Correct — matches your Customer model
      required: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",        // Correct — matches your updated Product model
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
      default: Date.now          // Perfect for 1-month reminders
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", saleSchema);  // Correct — "Sale" (singular)
