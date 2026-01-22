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
  Loader2,
  AlertCircle,
  IndianRupee,
  RefreshCw,
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
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      const list = res.data.products || res.data.data || res.data || [];
      setProducts(Array.isArray(list) ? list : []);
      setError("");
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Search filtering
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredProducts(products);
      return;
    }
    setFilteredProducts(
      products.filter(
        (p) =>
          (p.itemName || "").toLowerCase().includes(term) ||
          (p.stockBroughtBy || "").toLowerCase().includes(term)
      )
    );
  }, [searchTerm, products]);

  // Toast auto-hide
  useEffect(() => {
    if (!toast.show) return;
    const timer = setTimeout(() => setToast({ show: false }), 3000);
    return () => clearTimeout(timer);
  }, [toast.show]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const isActive = (path) => location.pathname === path;

  const navItem = (to, Icon, label) => (
    <Link to={to} className="flex flex-col items-center gap-1 flex-1">
      <div
        className={`flex flex-col items-center transition-all duration-200 ${
          isActive(to) ? "text-teal-400 scale-105" : "text-slate-400 hover:text-teal-300"
        }`}
      >
        <Icon size={24} />
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      {isActive(to) && <span className="mt-1 h-1 w-5 rounded-full bg-teal-400"></span>}
    </Link>
  );

  const totalStockValue = products.reduce(
    (sum, p) => sum + (Number(p.salePrice || 0) * Number(p.quantity || 0)),
    0
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-50 animate-fadeIn">
          <div
            className={`px-6 py-4 rounded-xl shadow-2xl text-white flex items-center gap-3 max-w-sm ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={24} />
            ) : (
              <AlertCircle size={24} />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-card shadow-sm p-5 flex justify-between items-center sticky top-0 z-10 border-b border-border">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 rounded-full hover:bg-muted transition"
          >
            <Menu size={28} className="text-foreground" />
          </button>

          {/* Edit Items */}
          <Link
            to="/cart"
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors text-sm font-medium"
          >
            <Edit size={18} />
            Edit Items
          </Link>

          {/* Order Tablets */}
          <Link
            to="/order-stock"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-colors text-sm font-medium shadow-sm"
          >
            <ShoppingCart size={18} />
            Order Tablets
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-primary">VISHWAS MEDICAL</h1>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-semibold">
            <RefreshCw
              onClick={fetchProducts}
              className="cursor-pointer hover:text-primary transition"
              size={20}
            />
            <IndianRupee className="text-green-600" size={20} />
            <span>{totalStockValue.toLocaleString("en-IN")}</span>
          </div>

          <Link to="/notifications" className="relative p-2">
            <Bell size={22} />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-card"></span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-5 md:p-8 max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="relative mb-8">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products or supplier..."
            className="w-full pl-12 pr-14 py-4 bg-card border border-border rounded-full text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/40 outline-none shadow-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Link
            to="/createProducts"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition"
          >
            <Plus size={18} />
          </Link>
        </div>

        {/* Products Section */}
        <div className="bg-card rounded-2xl p-6 shadow-md border border-border min-h-[50vh]">
          <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
            <Package size={24} />
            Products
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="mt-4 text-muted-foreground">Loading products...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-destructive">
              <AlertCircle size={64} className="mx-auto mb-6" />
              <p className="text-xl font-medium">{error}</p>
              <button
                onClick={fetchProducts}
                className="mt-6 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition"
              >
                Try Again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <AlertCircle size={64} className="mx-auto mb-6 opacity-50" />
              <p className="text-xl font-medium">
                {searchTerm ? "No matching products found" : "No products added yet"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((p) => (
                <div
                  key={p._id || Math.random()}
                  className="bg-card rounded-2xl shadow border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-200 overflow-hidden"
                >
                  <div className="p-5 border-b bg-muted/30">
                    <h3 className="text-lg font-bold text-foreground truncate">
                      {p.itemName || "Unnamed Product"}
                    </h3>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Supplier:</span>
                      <span className="font-medium">
                        {p.stockBroughtBy || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Quantity:</span>
                      <span className={`font-bold ${p.quantity === 0 ? "text-destructive" : ""}`}>
                        {p.quantity || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Sale Price:</span>
                      <span className="font-bold text-primary">
                        ₹{Number(p.salePrice || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border z-20">
        <div className="max-w-md mx-auto flex items-center px-2 py-3">
          {navItem("/sales", Receipt, "Bill")}
          {navItem("/createProducts", ShoppingBag, "Product")}
          {navItem("/createCustomer", Users, "Customer")}
          {navItem("/supplier-notes", FileText, "Supplier")}
          {navItem("/allsales", BarChart2, "Sales")}
        </div>
      </nav>

      {/* Drawer */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="fixed top-0 left-0 h-full w-80 bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between mb-8">
              <h2 className="text-xl font-bold text-primary">Menu</h2>
              <X size={26} className="cursor-pointer hover:text-primary" onClick={() => setIsDrawerOpen(false)} />
            </div>
            <Link
              to="/allproducts"
              className="flex items-center gap-3 p-4 rounded-xl bg-muted hover:bg-muted/80 transition mb-3"
              onClick={() => setIsDrawerOpen(false)}
            >
              <Package size={20} />
              All Products
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default First;
