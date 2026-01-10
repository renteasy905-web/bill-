// config/products.js

const mongoose = require("mongoose");

// =====================
// PRODUCT MODEL & CONTROLLERS
// =====================
const productSchema = new mongoose.Schema({
  itemName: { type: String, required: true, trim: true, unique: true },
  salePrice: { type: Number, required: true, min: 0 },
  purchasePrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  description: { type: String, trim: true, default: "" },
  expiryDate: { type: Date, default: null },
  latestUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

productSchema.pre("save", function (next) {
  this.latestUpdated = Date.now();
  next();
});

productSchema.pre("findOneAndUpdate", function (next) {
  this.set({ latestUpdated: Date.now() });
  next();
});

const Product = mongoose.model("Product", productSchema);

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
    const products = await Product.find().sort({ itemName: 1 });
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getProductsSortedByName = async (req, res) => {
  try {
    const products = await Product.find().sort({ itemName: 1 });
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
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// =====================
// CUSTOMER MODEL & CONTROLLERS (basic)
// =====================
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  address: { type: String, default: "" },
}, { timestamps: true });

const Customer = mongoose.model("Customer", customerSchema);

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

// =====================
// SALE MODEL & CONTROLLERS (basic)
// =====================
const saleSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
  }],
  totalAmount: { type: Number, required: true },
  paymentMode: { type: String, default: "Cash" },
}, { timestamps: true });

const Sale = mongoose.model("Sale", saleSchema);

const createSale = async (req, res) => {
  try {
    const sale = await Sale.create(req.body);
    res.status(201).json({ success: true, sale });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("customer", "name phone")
      .populate("items.product", "itemName salePrice");
    res.status(200).json({ success: true, sales });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("customer", "name phone")
      .populate("items.product", "itemName salePrice");
    if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });
    res.status(200).json({ success: true, sale });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateSaleById = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });
    res.status(200).json({ success: true, sale });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });
    res.status(200).json({ success: true, message: "Sale deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

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
