const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      unique: true,
    },
    salePrice: {
      type: Number,
      required: [true, 'Sale price is required'],
      min: [0, 'Sale price cannot be negative'],
    },
    purchasePrice: {
      type: Number,
      required: [true, 'Purchase price is required'],
      min: [0, 'Purchase price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
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
    stockBroughtBy: {
      type: String,
      required: [true, 'Stock brought by / Supplier name is required'],
      trim: true,
      minlength: [2, 'Supplier name too short'],
    },
    latestUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Auto-update latestUpdated timestamp
productSchema.pre('save', function (next) {
  this.latestUpdated = Date.now();
  next();
});

productSchema.pre('findOneAndUpdate', function (next) {
  this.set({ latestUpdated: Date.now() });
  next();
});

module.exports = mongoose.model('Product', productSchema);
