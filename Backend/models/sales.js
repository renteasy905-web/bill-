// models/sale.js
const mongoose = require("mongoose");

// =====================
// SALE SCHEMA
// =====================
const saleSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false,          // ← Optional for regular/walk-in sales
      default: null,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product is required"],
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: [true, "Price is required"],
          min: [0, "Price cannot be negative"],
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Card", "Other"],
      default: "Cash",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Virtual for display purposes
saleSchema.virtual("customerName").get(function () {
  return this.customer ? "Registered Customer" : "Regular / Walk-in";
});

// Populate on toJSON/toObject
saleSchema.set("toJSON", { virtuals: true });
saleSchema.set("toObject", { virtuals: true });

const Sale = mongoose.model("Sale", saleSchema);

// =====================
// CONTROLLERS (exported)
// =====================

// Create Sale (with stock deduction)
const createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customer, items, totalAmount, paymentMode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Items are required");
    }
    if (totalAmount === undefined || totalAmount === null) {
      throw new Error("totalAmount is required");
    }

    // Validate and deduct stock
    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) throw new Error(`Product not found: ${item.product}`);
      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.itemName}`);
      }
      product.quantity -= item.quantity;
      await product.save({ session });
    }

    const sale = await Sale.create(
      [{
        customer: customer || null,
        items,
        totalAmount,
        paymentMode: paymentMode || "Cash",
      }],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json({ success: true, sale: sale[0] });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// Get All Sales
const getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("customer", "name phone address")
      .populate("items.product", "itemName salePrice quantity")
      .sort({ date: -1 });
    res.status(200).json({ success: true, sales });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get Single Sale
const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("customer", "name phone address")
      .populate("items.product", "itemName salePrice quantity");
    if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });
    res.status(200).json({ success: true, sale });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update Sale (with stock adjustment)
const updateSaleById = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sale = await Sale.findById(req.params.id).session(session);
    if (!sale) throw new Error("Sale not found");

    const { items: newItems, totalAmount, paymentMode } = req.body;

    if (newItems && Array.isArray(newItems)) {
      // Restore old stock
      for (const oldItem of sale.items) {
        const product = await Product.findById(oldItem.product).session(session);
        if (product) {
          product.quantity += oldItem.quantity;
          await product.save({ session });
        }
      }

      // Deduct new stock
      for (const item of newItems) {
        const product = await Product.findById(item.product).session(session);
        if (!product) throw new Error(`Product not found: ${item.product}`);
        if (product.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.itemName}`);
        }
        product.quantity -= item.quantity;
        await product.save({ session });
      }

      sale.items = newItems;
    }

    if (totalAmount !== undefined) sale.totalAmount = totalAmount;
    if (paymentMode) sale.paymentMode = paymentMode;

    await sale.save({ session });
    await session.commitTransaction();

    res.status(200).json({ success: true, sale });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// Delete Sale (restore stock)
const deleteSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sale = await Sale.findById(req.params.id).session(session);
    if (!sale) throw new Error("Sale not found");

    // Restore stock
    for (const item of sale.items) {
      const product = await Product.findById(item.product).session(session);
      if (product) {
        product.quantity += item.quantity;
        await product.save({ session });
      }
    }

    await Sale.findByIdAndDelete(req.params.id).session(session);
    await session.commitTransaction();

    res.status(200).json({ success: true, message: "Sale deleted and stock restored" });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// Export all controllers
module.exports = {
  createProduct,
  getAllProducts,
  getProductsSortedByName,
  updateProduct,
  createCustomer,
  getAllCustomers,
  createSale,
  getAllSales,
  getSaleById,
  updateSaleById,
  deleteSale,
};
