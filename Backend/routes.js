const express = require("express");

const {
  Createproducts,
  fetch,
  edit,
  Createcustomer,
  createSale,
  fetchCustomers,
  allproducts,
  getAllSales,
  getSaleById,
  updateSaleById,
  deleteSale, // Added for delete functionality
} = require("./config/products");

const router = express.Router();

// Product Routes
router.post("/products", Createproducts);
router.get("/fetch", fetch);
router.put("/fetch/:id", edit);
router.get("/allproducts", allproducts);

// Customer Routes
router.post("/create", Createcustomer);
router.get("/getcustomers", fetchCustomers);

// Sale Routes
router.post("/sale", createSale);
router.get("/allsales", getAllSales);
router.get("/sales/:id", getSaleById);
router.put("/sales/:id", updateSaleById);
router.delete("/sales/:id", deleteSale); // New DELETE route

module.exports = router;
