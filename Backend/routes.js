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

// ====================
// PRODUCT ROUTES
// ====================
router.post("/products", Createproducts);
router.get("/fetch", fetch);                    // Get all products (sorted by name)
router.put("/fetch/:id", edit);                 // Update product by ID
router.get("/allproducts", allproducts);        // Get all products (sorted by expiry)

// ====================
// CUSTOMER ROUTES
// ====================
router.post("/create", Createcustomer);         // Create new customer
router.get("/getcustomers", fetchCustomers);    // Get all customers

// ====================
// SALE ROUTES (Billing & History)
// ====================
router.post("/sale", createSale);               // Create new sale (billing)
router.get("/allsales", getAllSales);           // Get all sales records
router.get("/sales/:id", getSaleById);          // Get single sale by ID
router.put("/sales/:id", updateSaleById);       // Update sale (e.g. items, quantity)
router.delete("/sales/:id", deleteSale);        // Delete sale & restore stock

module.exports = router;
