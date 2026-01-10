const express = require("express");
const {
  createProduct,
  getProductsSortedByName,
  updateProduct,
  createCustomer,
  createSale,
  getAllCustomers,
  getAllProducts,
  getAllSales,
  getSaleById,
  updateSaleById,
  deleteSale,
} = require("./config/products");

const router = express.Router();

// PRODUCT ROUTES
router.post("/products", createProduct);
router.get("/fetch", getProductsSortedByName);
router.put("/fetch/:id", updateProduct);
router.get("/allproducts", getAllProducts);

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
