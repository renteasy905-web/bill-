const express = require("express");
const router = express.Router();

/* =====================
   CONTROLLERS
===================== */
const productController  = require("../controllers/productController");
const customerController = require("../controllers/customerController");
const saleController     = require("../controllers/saleController");

/* =====================
   PRODUCT ROUTES
===================== */
// Create product
router.post("/products", productController.createProduct);

// Get all products
router.get("/allproducts", productController.getAllProducts);

// Update product by ID
router.put("/products/:id", productController.updateProduct);

/* =====================
   CUSTOMER ROUTES
===================== */
// Create customer
router.post("/customers", customerController.createCustomer);

// Get all customers
router.get("/customers", customerController.getAllCustomers);

/* =====================
   SALE ROUTES
===================== */
// Create sale
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
