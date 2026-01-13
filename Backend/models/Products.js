// models/Products.js
const mongoose = require("mongoose");

// ────────────────────────────────
// PRODUCT SCHEMA
// ────────────────────────────────
const productSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      unique: true,
    },
    Description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    Mrp: {
      type: Number,
      required: [true, "MRP / Sale price is required"],
      min: [0, "MRP cannot be negative"],
    },
    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: [0, "Purchase price cannot be negative"],
    },
    Quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    Expiry: {
      type: Date,
      required: false,
      default: null,
    },
    stockBroughtBy: {
      type: String,
      required: [true, "Stock brought by / Supplier name is required"],
      trim: true,
      minlength: [2, "Supplier name is too short"],
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

// ────────────────────────────────
// CUSTOMER SCHEMA
// ────────────────────────────────
const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);

// ────────────────────────────────
// SALE SCHEMA
// ────────────────────────────────
const saleSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
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
      min: [0, "Total cannot be negative"],
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

const Sale = mongoose.model("Sale", saleSchema);

// ────────────────────────────────
// CONTROLLERS
// ────────────────────────────────

// Product Controllers
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ Name: 1 });
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getProductsSortedByName = async (req, res) => {
  try {
    const products = await Product.find().sort({ Name: 1 });
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Customer Controllers
const createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, customer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.status(200).json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Sale Controllers - with transactions for atomic stock updates
const createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customer, items, totalAmount, paymentMode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Items are required");
    }

    // Validate stock availability
    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) throw new Error(`Product not found: ${item.product}`);
      if (product.Quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.Name}`);
      }
    }

    // Deduct stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { Quantity: -item.quantity } },
        { session }
      );
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

const getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("customer", "name phone address")
      .populate("items.product", "Name Mrp")
      .sort({ date: -1 });
    res.status(200).json({ success: true, sales });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("customer", "name phone address")
      .populate("items.product", "Name Mrp");
    if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });
    res.status(200).json({ success: true, sale });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

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
        await Product.findByIdAndUpdate(
          oldItem.product,
          { $inc: { Quantity: oldItem.quantity } },
          { session }
        );
      }

      // Validate and deduct new stock
      for (const item of newItems) {
        const product = await Product.findById(item.product).session(session);
        if (!product) throw new Error(`Product not found: ${item.product}`);
        if (product.Quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.Name}`);
        }
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { Quantity: -item.quantity } },
          { session }
        );
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

const deleteSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sale = await Sale.findById(req.params.id).session(session);
    if (!sale) throw new Error("Sale not found");

    // Restore stock
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { Quantity: item.quantity } },
        { session }
      );
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

// ────────────────────────────────
// EXPORTS
// ────────────────────────────────
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
