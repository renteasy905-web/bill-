const express = require("express");
const router = express.Router();

/* =====================
   CONTROLLERS
===================== */
const productController = require("./controllers/productController");
const customerController = require("./controllers/CustomerController");
const saleController = require("./controllers/SaleController");

/* =====================
   PRODUCT ROUTES
===================== */
// Create a new product
router.post("/products", productController.createProduct);

// Get all products
router.get("/products", productController.getAllProducts);

// Update product by ID
router.put("/products/:id", productController.updateProduct);

/* =====================
   CUSTOMER ROUTES
===================== */
// Create a new customer
router.post("/customers", customerController.createCustomer);

// Get all customers
router.get("/customers", customerController.getAllCustomers);

/* =====================
   SALE ROUTES
===================== */
// Create a new sale
router.post("/sales", saleController.createSale);

// Get all sales
router.get("/sales", saleController.getAllSales);

// Get sale by ID
router.get("/sales/:id", saleController.getSaleById);

// Update sale by ID
router.put("/sales/:id", saleController.updateSaleById);

// Delete sale by ID
router.delete("/sales/:id", saleController.deleteSale);

module.exports = router;
