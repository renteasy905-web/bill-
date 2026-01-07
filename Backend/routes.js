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
} = require("./config/products");

const route = express.Router();

route.post("/products", Createproducts);
route.get("/fetch", fetch);
route.put("/fetch/:id", edit);

route.post("/create", Createcustomer);
route.post("/sale", createSale);

route.get("/getcustomers", fetchCustomers);
route.get("/allproducts", allproducts);

route.get("/allsales", getAllSales);
route.get("/sales/:id", getSaleById);
route.put("/sales/:id", updateSaleById);

module.exports = route;
