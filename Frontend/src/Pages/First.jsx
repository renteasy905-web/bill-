import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import {
  Menu,
  Search,
  Plus,
  Receipt,
  ShoppingBag,
  FileText,
  BarChart2,
  Users,
  Bell,
  X,
  Package,
  Edit,
  ShoppingCart,
} from "lucide-react";

const First = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get("/products");
        const list = res.data.products || res.data.data || res.data || [];
        setProducts(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredProducts(products); // Show ALL products when search is empty
      return;
    }
    setFilteredProducts(
      products.filter(
        (p) =>
          (p.itemName || p.Name || "").toLowerCase().includes(term) ||
          (p.stockBroughtBy || "").toLowerCase().includes(term)
      )
    );
  }, [searchTerm, products]);

  const isActive = (path) => location.pathname === path;

  const navItem = (to, Icon, label) => (
    <Link to={to} className="flex flex-col items-center gap-1 flex-1">
      <div
        className={`flex flex-col items-center transition-all duration-200 ${
          isActive(to)
            ? "text-teal-400 scale-105"
            : "text-slate-400 hover:text-teal-300"
        }`}
      >
        <Icon size={24} />
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      {isActive(to) && (
        <span className="mt-1 h-1 w-5 rounded-full bg-teal-400"></span>
      )}
    </Link>
  );

  return (
    <div className="min-h-screen text-white flex flex-col bg-gradient-to-b from-[#0c1b29] via-[#112637] to-[#0d1f2f]">
      {/* TOP BAR / HEADER */}
      <header className="bg-[#112637]/70 backdrop-blur-xl px-4 py-3 flex items-center justify-between border-b border-white/10 sticky top-0 z-20">
        {/* Left side: Menu + New Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <Menu size={28} />
          </button>

          {/* Edit Items Button */}
          <Link
            to="/cart"
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700 text-sm font-medium"
          >
            <Edit size={18} />
            Edit Items
          </Link>

          {/* Order Tablets Button */}
          <Link
            to="/order-stock"
            className="flex items-center gap-2 px-4 py-2 bg-teal-600/80 hover:bg-teal-600 rounded-xl transition-colors text-sm font-medium shadow-sm"
          >
            <ShoppingCart size={18} />
            Order Tablets
          </Link>
        </div>

        {/* Center Title */}
        <h1 className="text-xl font-bold">VISHWAS MEDICAL</h1>

        {/* Right side: Notifications */}
        <div className="flex items-center gap-4">
          <Link to="/notifications" className="relative p-2">
            <Bell size={22} />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#112637]" />
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 py-6 pb-28">
        {/* SEARCH BAR */}
        <div className="relative mb-6">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products or supplier..."
            className="w-full pl-12 pr-14 py-4 bg-white/10 border border-white/10 rounded-full text-white placeholder-white/50 focus:ring-2 focus:ring-teal-400/40 outline-none"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
          <Link
            to="/createProducts"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-teal-400 text-[#0a1c27] p-3 rounded-full shadow-lg"
          >
            <Plus size={18} />
          </Link>
        </div>

        {/* PRODUCTS LIST */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 min-h-[50vh] border border-white/10">
          <h2 className="text-lg font-semibold text-teal-300 mb-4">Products</h2>

          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              {searchTerm ? "No matching products found" : "No products added yet"}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((p) => (
                <div
                  key={p._id || `${p.itemName}-${Math.random()}`}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="font-semibold text-lg">{p.itemName || "Unnamed Product"}</div>
                  <div className="text-sm text-white/70 mt-1">
                    {p.stockBroughtBy ? `By: ${p.stockBroughtBy}` : "No supplier"}
                  </div>
                  <div className="text-sm text-white/60 mt-1">
                    Qty: <span className="font-medium">{p.quantity || 0}</span> • ₹
                    {Number(p.salePrice || 0).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f1f2e]/90 backdrop-blur-xl border-t border-white/10 z-20">
        <div className="max-w-md mx-auto flex items-center px-2 py-3">
          {navItem("/sales", Receipt, "Bill")}
          {navItem("/createProducts", ShoppingBag, "Product")}
          {navItem("/createCustomer", Users, "Customer")}
          {navItem("/supplier-notes", FileText, "Supplier")}
          {navItem("/allsales", BarChart2, "Sales")}
        </div>
      </nav>

      {/* SIDE DRAWER / MENU */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="fixed top-0 left-0 h-full w-80 bg-[#0f172a] p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-teal-300">Menu</h2>
              <X
                size={26}
                className="cursor-pointer hover:text-teal-400"
                onClick={() => setIsDrawerOpen(false)}
              />
            </div>

            <Link
              to="/allproducts"
              className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors mb-3"
              onClick={() => setIsDrawerOpen(false)}
            >
              <Package size={20} />
              All Products
            </Link>

            {/* You can add more menu items here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default First;
