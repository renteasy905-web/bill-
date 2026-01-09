const products = require("../models/products");
const sales = require("../models/sales");
const customer = require("../models/customer");

const Createproducts = async (req, res) => {
  try {
    const { Name, Description, Mrp, Quantity, Expiry } = req.body;
    if (!Name || !Description || !Mrp || !Quantity || !Expiry) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const Product = await products.create({
      Name,
      Description,
      Mrp,
      Quantity,
      Expiry,
    });
    return res.status(201).json({ message: "Product created successfully", Product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const fetch = async (req, res) => {
  try {
    const t = await products.find().sort({ Name: 1 });
    return res.status(200).json({ message: "All products fetched", t });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const edit = async (req, res) => {
  try {
    const Items = await products.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!Items) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ Items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const Createcustomer = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    if (!name || !phone) {  // address optional
      return res.status(400).json({ message: "Name and phone are required" });
    }
    const newcustomer = await customer.create({ name, phone, address });
    return res.status(201).json({ message: "Customer created", newcustomer });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create customer", error: error.message });
  }
};

const createSale = async (req, res) => {
  const { customer, items, paymentMode } = req.body;
  try {
    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Customer and items are required" });
    }

    let totalAmount = 0;
    for (let item of items) {
      const product = await products.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      if (product.Quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.Name}` });
      }
      product.Quantity -= item.quantity;
      await product.save();
      totalAmount += item.price * item.quantity;
    }

    const sale = await sales.create({
      customer,
      items,
      totalAmount,
      paymentMode: paymentMode || "Cash",
    });

    res.status(201).json({ success: true, sale });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create sale", error: error.message });
  }
};

const fetchCustomers = async (req, res) => {
  try {
    const customers = await customer.find().sort({ name: 1 });
    return res.status(200).json({ customers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const allproducts = async (req, res) => {
  try {
    const allproducts = await products.find().sort({ Expiry: 1 });
    return res.status(200).json({ message: "All products here", allproducts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAllSales = async (req, res) => {
  try {
    const salesData = await sales.find()
      .populate("customer", "name phone address")  // full customer info
      .populate("items.product", "Name Mrp Description Quantity Expiry")  // full product info
      .sort({ date: -1 });  // sort by sale date (newest first)

    res.status(200).json({
      success: true,
      count: salesData.length,
      sales: salesData  // consistent key name
    });
  } catch (error) {
    console.error("getAllSales error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sales",
      error: error.message
    });
  }
};

const getSaleById = async (req, res) => {
  try {
    const sale = await sales.findById(req.params.id)
      .populate("customer", "name phone address")
      .populate("items.product", "Name Mrp Description Quantity Expiry");

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.status(200).json({ success: true, sale });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateSaleById = async (req, res) => {
  try {
    const updatedSale = await sales.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedSale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.status(200).json({ success: true, updatedSale });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

module.exports = {
  Createproducts,
  fetch,
  edit,
  Createcustomer,
  createSale,
  fetchCustomers,
  allproducts,
  getAllSales,
  getSaleById,
  updateSaleById
};
