const express = require("express");
const router = express.Router();

// Correct relative paths (assuming controllers/ is sibling folder to routes.js)
const productController   = require("../controllers/productController");
const customerController  = require("../controllers/customerController");
const saleController      = require("../controllers/saleController");

// PRODUCT ROUTES
router.post("/products",        productController.createProduct);
router.get("/allproducts",      productController.getAllProducts);
router.put("/products/:id",     productController.updateProduct);

// CUSTOMER ROUTES
router.post("/customers",       customerController.createCustomer);
router.get("/customers",        customerController.getAllCustomers);

// SALE ROUTES
router.post("/sales",           saleController.createSale);
router.get("/sales",            saleController.getAllSales);
router.get("/sales/:id",        saleController.getSaleById);
router.put("/sales/:id",        saleController.updateSaleById);
router.delete("/sales/:id",     saleController.deleteSale);

module.exports = router;
