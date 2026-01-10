// routes.js

const express = require("express");
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
} = require("./config/products");

const router = express.Router();

// =====================
// PRODUCT ROUTES
// =====================
router.post("/products", createProduct);                  
router.get("/allproducts", getAllProducts);              
router.get("/fetch", getProductsSortedByName);            
router.put("/fetch/:id", updateProduct);                  

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
