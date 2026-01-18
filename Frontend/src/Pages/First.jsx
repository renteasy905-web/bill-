import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";

const First = () => {
  const navigate = useNavigate();
  const [isLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  /* ───────── AUTH CHECK ───────── */
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
        Login Required
      </div>
    );
  }

  /* ───────── FETCH PRODUCTS (same as AllProducts) ───────── */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        const list = res.data.products || res.data.data || res.data || [];
        setProducts(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Product fetch failed", err);
      }
    };
    fetchProducts();
  }, []);

  /* ───────── SEARCH LOGIC (same as AllProducts) ───────── */
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts([]);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = products.filter(
      (p) =>
        (p.itemName || p.Name || "").toLowerCase().includes(term) ||
        (p.stockBroughtBy || "").toLowerCase().includes(term)
    );

    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  return (
    <div className="min-h-screen text-white flex flex-col bg-gradient-to-b from-[#0c1b29] via-[#112637] to-[#0d1f2f]">
      {/* ───────── TOP BAR ───────── */}
      <header className="bg-[#112637]/70 backdrop-blur-xl px-4 py-3 flex items-center justify-between border-b border-white/10 sticky top-0 z-20">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 rounded-lg hover:bg-white/10"
        >
          <Menu size={28} />
        </button>

        <h1 className="text-xl md:text-2xl font-bold tracking-wide">
          VISHWAS MEDICAL
        </h1>

        <div className="flex items-center gap-5">
          <Link to="/notifications" className="relative p-2">
            <Bell size={24} />
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#112637]" />
          </Link>

          <button
            onClick={() => {
              localStorage.removeItem("isLoggedIn");
              navigate("/");
            }}
            className="px-4 py-2 bg-[#ffe7d4] text-[#2b2b2b] font-semibold rounded-xl"
          >
            Logout →
          </button>
        </div>
      </header>

      {/* ───────── MAIN CONTENT ───────── */}
      <main className="flex-1 px-4 py-6 pb-32">
        {/* SEARCH BAR */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search products or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-14 py-4 bg-white/10 border border-white/10 rounded-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
          />
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
          />
          <Link
            to="/createProducts"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#50d8df] to-[#87e7cb] text-[#0a1c27] p-3 rounded-full"
          >
            <Plus size={20} />
          </Link>
        </div>

        {/* PRODUCTS RESULT AREA */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 min-h-[50vh] border border-white/10">
          <h2 className="text-xl font-bold text-[#86e7d0] mb-4">Products</h2>

          {/* EMPTY when no search */}
          {searchTerm && filteredProducts.length === 0 && null}

          {/* SHOW RESULTS */}
          <div className="space-y-4">
            {filteredProducts.map((p) => (
              <div
                key={p._id}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <div className="font-bold text-lg">
                  {p.itemName || p.Name || "Unnamed Product"}
                </div>
                <div className="text-sm text-white/70">
                  Supplier: {p.stockBroughtBy || "—"}
                </div>
                <div className="text-sm text-white/70">
                  Qty: {p.quantity || p.Quantity || 0}
                </div>
                <div className="text-sm text-white/70">
                  Price: ₹{p.salePrice || p.Mrp || "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ───────── BOTTOM NAV ───────── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#112637]/70 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-md mx-auto px-2 py-3 flex justify-around">
          <Link to="/sales" className="flex flex-col items-center text-[#86e7d0]">
            <Receipt size={26} />
            <span className="text-xs">Create Bill</span>
          </Link>

          <Link to="/createProducts" className="flex flex-col items-center text-white/60">
            <ShoppingBag size={26} />
            <span className="text-xs">Add Product</span>
          </Link>

          <Link to="/createCustomer" className="flex flex-col items-center text-white/60">
            <Users size={26} />
            <span className="text-xs">Customer</span>
          </Link>

          <Link to="/supplier-notes" className="flex flex-col items-center text-white/60">
            <FileText size={26} />
            <span className="text-xs">Supplier</span>
          </Link>

          <Link to="/allsales" className="flex flex-col items-center text-white/60">
            <BarChart2 size={26} />
            <span className="text-xs">Sales</span>
          </Link>
        </div>
      </nav>

      {/* ───────── SIDE DRAWER ───────── */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="fixed top-0 left-0 h-full w-80 bg-[#0f172a] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#86e7d0]">Menu</h2>
              <button onClick={() => setIsDrawerOpen(false)}>
                <X size={28} />
              </button>
            </div>

            <div className="space-y-3">
              <Link to="/allproducts" className="flex gap-4 p-4 rounded-xl bg-white/5">
                <Package /> All Products
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default First;
