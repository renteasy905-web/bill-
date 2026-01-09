const Product = require("../models/products");
const Sale = require("../models/sales");
const Customer = require("../models/customer");

// =====================
// PRODUCT CONTROLLERS
// =====================
const createProduct = async (req, res) => {
  try {
    const { Name, Description, Mrp, Quantity, Expiry } = req.body;

    if (!Name || !Description || !Mrp || !Quantity || !Expiry) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const product = await Product.create({ Name, Description, Mrp, Quantity, Expiry });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ Expiry: 1 });
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getProductsSortedByName = async (req, res) => {
  try {
    const products = await Product.find().sort({ Name: 1 });
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Fetch products error:", error);
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
    console.error("Update product error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =====================
// CUSTOMER CONTROLLERS
// =====================
const createCustomer = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: "Name and phone are required" });
    }

    const customer = await Customer.create({ name, phone, address });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    console.error("Create customer error:", error);
    res.status(500).json({ success: false, message: "Failed to create customer", error: error.message });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.status(200).json({ success: true, customers });
  } catch (error) {
    console.error("Fetch customers error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =====================
// SALE CONTROLLERS
// =====================
const createSale = async (req, res) => {
  try {
    const { customer, items, paymentMode } = req.body;

    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Customer and items are required" });
    }

    let totalAmount = 0;

    // Validate stock and calculate total
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      }
      if (product.Quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.Name} (Available: ${product.Quantity})`,
        });
      }

      product.Quantity -= item.quantity;
      await product.save();

      totalAmount += item.price * item.quantity;
    }

    const sale = await Sale.create({
      customer,
      items,
      totalAmount,
      paymentMode: paymentMode || "Cash",
    });

    res.status(201).json({ success: true, message: "Sale created", sale });
  } catch (error) {
    console.error("Create sale error:", error);
    res.status(500).json({ success: false, message: "Failed to create sale", error: error.message });
  }
};

const getAllSales = async (req, res) => {
  try {
    const salesData = await Sale.find()
      .populate("customer", "name phone address")
      .populate("items.product", "Name Mrp Description Quantity Expiry")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: salesData.length,
      sales: salesData,
    });
  } catch (error) {
    console.error("Get all sales error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch sales", error: error.message });
  }
};

const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("customer", "name phone address")
      .populate("items.product", "Name Mrp Description Quantity Expiry");

    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found" });
    }

    res.status(200).json({ success: true, sale });
  } catch (error) {
    console.error("Get sale by ID error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateSaleById = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "Items array is required" });
    }

    const originalSale = await Sale.findById(req.params.id);
    if (!originalSale) {
      return res.status(404).json({ success: false, message: "Sale not found" });
    }

    // Restore old stock
    for (const oldItem of originalSale.items) {
      const product = await Product.findById(oldItem.product);
      if (product) {
        product.Quantity += oldItem.quantity;
        await product.save();
      }
    }

    // Calculate new total & deduct new stock
    let newTotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      }
      if (product.Quantity < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.Name}` });
      }

      product.Quantity -= item.quantity;
      await product.save();

      newTotal += item.price * item.quantity;
    }

    const updatedSale = await Sale.findByIdAndUpdate(
      req.params.id,
      { items, totalAmount: newTotal },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Sale updated successfully",
      sale: updatedSale,
    });
  } catch (error) {
    console.error("Update sale error:", error);
    res.status(500).json({ success: false, message: "Failed to update sale", error: error.message });
  }
};

const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found" });
    }

    // Restore stock
    for (const item of sale.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.Quantity += item.quantity;
        await product.save();
      }
    }

    await Sale.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Sale deleted successfully and stock restored",
    });
  } catch (error) {
    console.error("Delete sale error:", error);
    res.status(500).json({ success: false, message: "Failed to delete sale", error: error.message });
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
