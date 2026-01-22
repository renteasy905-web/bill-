// Backend/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      unique: true,
    },
    stockBroughtBy: {
      type: String,
      required: [true, 'Stock brought by / Supplier name is required'],
      trim: true,
      minlength: [2, 'Supplier name too short'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    purchasePrice: {
      type: Number,
      required: [true, 'Purchase price is required'],
      min: [0, 'Purchase price cannot be negative'],
      default: 0,
    },
    salePrice: {
      type: Number,
      required: [true, 'Sale price is required'],
      min: [0, 'Sale price cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    // Explicitly include createdAt (used in supplier summary for lastStockDate)
    createdAt: {
      type: Date,
      default: Date.now,
    },
    latestUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // auto adds createdAt & updatedAt
);

// Auto-update latestUpdated timestamp on save and update
productSchema.pre('save', function (next) {
  this.latestUpdated = Date.now();
  next();
});

productSchema.pre('findOneAndUpdate', function (next) {
  this.set({ latestUpdated: Date.now() });
  next();
});

// Recommended indexes for faster queries (especially aggregation by supplier)
productSchema.index({ stockBroughtBy: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
