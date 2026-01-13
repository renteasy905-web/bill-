// routes.js (or routes/index.js)
const express = require('express');
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  // ...
} = require('../controllers/productController');

const {
  createCustomer,
  getAllCustomers,
} = require('../controllers/customerController');

const {
  createSale,
  getAllSales,
  // ...
} = require('../controllers/saleController');

// ── Product routes ──
router.post('/products', createProduct);
router.get('/products', getAllProducts);     // ← better name than /allproducts

// ── Customer routes ──
router.post('/customers', createCustomer);
router.get('/customers', getAllCustomers);

// ── Sale routes ──
router.post('/sales', createSale);
router.get('/sales', getAllSales);
router.get('/sales/:id', getSaleById);
router.put('/sales/:id', updateSaleById);
router.delete('/sales/:id', deleteSale);

module.exports = router;
