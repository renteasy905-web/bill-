import express from "express";
import {
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
  deleteSale,
} from "./config/products.js";

const router = express.Router();

// PRODUCT ROUTES
router.post("/products", Createproducts);
router.get("/fetch", fetch);
router.put("/fetch/:id", edit);
router.get("/allproducts", allproducts);

// CUSTOMER ROUTES
router.post("/create", Createcustomer);
router.get("/getcustomers", fetchCustomers);

// SALE ROUTES
router.post("/sale", createSale);
router.get("/allsales", getAllSales);
router.get("/sales/:id", getSaleById);
router.put("/sales/:id", updateSaleById);
router.delete("/sales/:id", deleteSale);

export default router;
