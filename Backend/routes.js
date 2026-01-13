// routes.js
const express = require("express");
const router = express.Router();

// FIXED IMPORT - Capital P is important!
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
} = require("./models/Products");

// =====================
// PRODUCT ROUTES
// =====================
router.post("/products", createProduct);
router.get("/allproducts", getAllProducts);
router.get("/fetch", getProductsSortedByName);
router.put("/fetch/:id", updateProduct);  // ← consider renaming to "/products/:id" later

// =====================
// CUSTOMER ROUTES
// =====================
router.post("/create", createCustomer);
router.get("/getcustomers", getAllCustomers);

// =====================
// SALE ROUTES
// =====================
router.post("/sale", createSale);
router.get("/allsales", getAllSales);
router.get("/sales/:id", getSaleById);
router.put("/sales/:id", updateSaleById);
router.delete("/sales/:id", deleteSale);

module.exports = router;
