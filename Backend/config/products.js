// config/products.js

const mongoose = require("mongoose");

// ====================
// PRODUCT SCHEMA
// ====================
const productSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      unique: true, // optional: prevent duplicate names
    },
    salePrice: {
      type: Number,
      required: [true, "Sale price is required"],
      min: [0, "Sale price cannot be negative"],
    },
    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: [0, "Purchase price cannot be negative"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    latestUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Auto-update latestUpdated on every save/update
productSchema.pre("save", function (next) {
  this.latestUpdated = Date.now();
  next();
});

productSchema.pre("findOneAndUpdate", function (next) {
  this.set({ latestUpdated: Date.now() });
  next();
});

const Product = mongoose.model("Product", productSchema);

// ====================
// PRODUCT CONTROLLERS
// ====================

const createProduct = async (req, res) => {
  try {
    const { itemName, salePrice, purchasePrice, quantity, description, expiryDate } = req.body;

    if (!itemName || !salePrice || !purchasePrice || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "itemName, salePrice, purchasePrice, and quantity are required",
      });
    }

    const product = await Product.create({
      itemName,
      salePrice,
      purchasePrice,
      quantity,
      description: description || "",
      expiryDate: expiryDate || null,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Product with this name already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ itemName: 1 });
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getProductsSortedByName = async (req, res) => {
  try {
    const products = await Product.find().sort({ itemName: 1 });
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Fetch products error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Product with this name already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// You can add deleteProduct later if needed

module.exports = {
  createProduct,
  getAllProducts,
  getProductsSortedByName,
  updateProduct,
};
