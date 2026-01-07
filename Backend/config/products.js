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

const Createcustomer = async (req, res)=>{

 try {
   const {name , phone , address} = req.body;

   if(!name || !phone || !address){
      return res.json({message : "failed"})
   };

   const newcustomer = await customer.create({name , phone , address});

   return res.json({message:"created" , newcustomer})

 } catch (error) {

   return res.json({message: "failed completely"})
   
 }
}
const createSale = async (req, res) => {
  const { customer, items, paymentMode } = req.body;

  let totalAmount = 0;

  for (let item of items) {
    const product = await products.findById(item.product);
    if (!product || product.stock < item.quantity) {
      return res.status(400).json({ message: "Stock not sufficient" });
    }

    product.Quantity -= item.quantity;
    await product.save();

    totalAmount += item.price * item.quantity;
  }

  const sale = await sales.create({
    customer,
    items,
    totalAmount,
    paymentMode
  });

  res.status(201).json(sale);
};

const fetchCustomers = async(req , res)=>{
   const customers = await customer.find();

   return res.json({customers});
};

const allproducts = async (req , res)=>{

   const allproducts = await products.find().sort({Expiry:1});

   return res.status(200).json({message : "all products here" , allproducts});
};


const getAllSales = async (req, res) => {
  try {
    const sale = await sales.find()
      .populate("customer", "name")
      .populate("items.product", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sales.length,
      sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET sale by ID
const getSaleById = async (req, res) => {
  try {
    const sale = await sales.findById(req.params.id)
      .populate("customer", "name")
      .populate("items.product", "name");

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.status(200).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE sale by ID
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

    res.status(200).json(updatedSale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {Createproducts, fetch , edit , Createcustomer , createSale , fetchCustomers , allproducts , getAllSales , getSaleById , updateSaleById};