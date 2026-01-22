// routes.js (updated with supplier summary)
const express = require("express");
const router = express.Router();

const productController = require("./controllers/productController");
const customerController = require("./controllers/CustomerController");
const saleController = require("./controllers/SaleController");
const supplierController = require("./controllers/supplierController"); // ← NEW IMPORT

// Existing product routes
router.post("/products", productController.createProduct);
router.get("/products", productController.getAllProducts);
router.put("/products/:id", productController.updateProduct);

// Existing customer routes
router.post("/customers", customerController.createCustomer);
router.get("/customers", customerController.getAllCustomers);

// Existing sale routes
router.post("/sales", saleController.createSale);
router.get("/sales", saleController.getAllSales);
router.get("/sales/:id", saleController.getSaleById);
router.put("/sales/:id", saleController.updateSaleById);
router.delete("/sales/:id", saleController.deleteSale);

// NEW: Supplier summary endpoint
// This matches frontend call → /api/suppliers/summary
router.get("/suppliers/summary", supplierController.getSupplierSummary);

module.exports = router;
