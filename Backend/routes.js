// routes.js
const express = require("express");

// Import all controllers from your model file
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
} = require("./models/Products"); // ← This is the correct path (capital P)

const router = express.Router();

// =====================
// PRODUCT ROUTES
// =====================
router.post("/products", createProduct);
router.get("/allproducts", getAllProducts);
router.get("/fetch", getProductsSortedByName);
router.put("/fetch/:id", updateProduct); // Suggestion: change to "/products/:id" later

// =====================
// CUSTOMER ROUTES
// =====================
router.post("/create", createCustomer);
router.get("/getcustomers", getAllCustomers); // Suggestion: change to "/customers" later

// =====================
// SALE ROUTES
// =====================
router.post("/sale", createSale);
router.get("/allsales", getAllSales);
router.get("/sales/:id", getSaleById);
router.put("/sales/:id", updateSaleById);
router.delete("/sales/:id", deleteSale);

module.exports = router;
