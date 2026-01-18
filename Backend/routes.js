// routes.js (current version - no change for now)
const express = require("express");
const router = express.Router();

const productController = require("./controllers/productController");
const customerController = require("./controllers/CustomerController");
const saleController = require("./controllers/SaleController");

router.post("/products", productController.createProduct);
router.get("/products", productController.getAllProducts);
router.put("/products/:id", productController.updateProduct);

router.post("/customers", customerController.createCustomer);
router.get("/customers", customerController.getAllCustomers);

router.post("/sales", saleController.createSale);
router.get("/sales", saleController.getAllSales);
router.get("/sales/:id", saleController.getSaleById);
router.put("/sales/:id", saleController.updateSaleById);
router.delete("/sales/:id", saleController.deleteSale);

module.exports = router;
