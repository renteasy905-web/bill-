// routes.js  — clean & working version without controllers folder

const express = require("express");
const router = express.Router();

// Import ALL functions from your current main file (choose one!)
const {
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
} = require("./models/products");   // ← CHANGE THIS PATH to your actual file!

// PRODUCT ROUTES
router.post("/products", createProduct);
router.get("/allproducts", getAllProducts);
router.get("/fetch", getProductsSortedByName);
router.put("/fetch/:id", updateProduct);   // consider changing to /products/:id

// CUSTOMER ROUTES
router.post("/create", createCustomer);
router.get("/getcustomers", getAllCustomers);

// SALE ROUTES
router.post("/sale", createSale);
router.get("/allsales", getAllSales);
router.get("/sales/:id", getSaleById);
router.put("/sales/:id", updateSaleById);
router.delete("/sales/:id", deleteSale);

module.exports = router;
