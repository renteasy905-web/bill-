import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Search, RefreshCw, ArrowLeft, AlertTriangle } from "lucide-react";

const AllProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const today = new Date();
  const todayFormatted = today.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/products"); // ← updated endpoint
      console.log("API Response Status:", res.status);
      console.log("Full API Response:", res.data);

      const productList = res.data.products || res.data.data || res.data || [];
      console.log("Extracted Products:", productList);
      console.log("Number of products:", productList.length);

      if (!Array.isArray(productList)) {
        throw new Error("Invalid products format from server");
      }

      setProducts(productList);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 120000); // Auto-refresh every 2 minutes
    return () => clearInterval(interval);
  }, []);

  // Search filter (product name + supplier)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = products.filter((p) =>
      (p.itemName || p.Name || "").toLowerCase().includes(term) ||
      (p.stockBroughtBy || "").toLowerCase().includes(term)
    );

    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Expiry status (handles both Expiry and expiryDate)
  const getExpiryInfo = (expiry) => {
    const expiryDate = expiry || null;
    if (!expiryDate) return { color: "#9ca3af", label: "No Expiry" };

    const exp = new Date(expiryDate);
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { color: "#ef4444", label: "EXPIRED" };
    if (diffDays <= 90) return { color: "#f97316", label: "≤ 3 Months" };
    if (diffDays <= 180) return { color: "#eab308", label: "≤ 6 Months" };
    return { color: "#22c55e", label: "Safe" };
  };

  // Sort by nearest expiry
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const da = (a.Expiry || a.expiryDate) ? new Date(a.Expiry || a.expiryDate) : new Date("9999-12-31");
    const db = (b.Expiry || b.expiryDate) ? new Date(b.Expiry || b.expiryDate) : new Date("9999-12-31");
    return da - db;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-2xl text-indigo-400 animate-pulse flex items-center gap-3">
          <RefreshCw className="animate-spin" size={24} />
          Loading inventory...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-red-400 text-xl p-6 text-center">
        <AlertTriangle size={64} className="mb-6 text-red-500" />
        {error}
        <button
          onClick={fetchProducts}
          className="mt-6 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-bold transition shadow-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-700/70 hover:bg-slate-600 rounded-lg text-white transition-all shadow-md"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-400 mb-3">
              All Products Inventory
            </h1>
            <p className="text-lg text-slate-300">
              Current Date: <strong className="text-white">{todayFormatted}</strong>
            </p>
          </div>

          <button
            onClick={fetchProducts}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600/70 hover:bg-indigo-600 rounded-lg text-white transition-all shadow-md disabled:opacity-50"
          >
            <RefreshCw size={18} className={`${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full mb-8">
          <input
            type="text"
            placeholder="Search by product name or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-full text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        </div>

        {/* Last Refreshed */}
        <div className="text-right text-sm text-slate-400 mb-6 flex items-center justify-end gap-2">
          <RefreshCw size={16} className="text-indigo-400" />
          Last updated: {lastRefreshed.toLocaleTimeString("en-IN")}
        </div>

        {sortedProducts.length === 0 ? (
          <div className="text-center py-20 text-xl text-slate-400 bg-slate-800/50 rounded-2xl">
            {searchTerm ? "No matching products found" : "No products in inventory yet"}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            {!isMobile ? (
              <div className="overflow-x-auto bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700">
                <table className="w-full text-left">
                  <thead className="bg-slate-700/80">
                    <tr>
                      <th className="px-8 py-6 font-semibold text-indigo-300">Item Name</th>
                      <th className="px-8 py-6 font-semibold text-indigo-300">Supplier</th>
                      <th className="px-8 py-6 font-semibold text-indigo-300">Description</th>
                      <th className="px-8 py-6 font-semibold text-indigo-300">Current Qty</th>
                      <th className="px-8 py-6 font-semibold text-indigo-300">Sale Price</th>
                      <th className="px-8 py-6 font-semibold text-indigo-300">Purchase Price</th>
                      <th className="px-8 py-6 font-semibold text-indigo-300">Expiry Date</th>
                      <th className="px-8 py-6 font-semibold text-indigo-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProducts.map((p) => {
                      const exp = getExpiryInfo(p.Expiry || p.expiryDate);
                      return (
                        <tr
                          key={p._id}
                          className="border-b border-slate-700 hover:bg-slate-700/50 transition-all duration-200"
                        >
                          <td className="px-8 py-6 font-medium">{p.itemName || p.Name || "—"}</td>
                          <td className="px-8 py-6">{p.stockBroughtBy || "Unknown Supplier"}</td>
                          <td className="px-8 py-6 text-slate-300">{p.description || p.Description || "—"}</td>
                          <td className="px-8 py-6 font-bold text-white">{p.quantity || p.Quantity || 0}</td>
                          <td className="px-8 py-6">₹{p.salePrice?.toFixed(2) || p.Mrp?.toFixed(2) || "—"}</td>
                          <td className="px-8 py-6">₹{p.purchasePrice?.toFixed(2) || "—"}</td>
                          <td className="px-8 py-6">
                            {p.Expiry || p.expiryDate
                              ? new Date(p.Expiry || p.expiryDate).toLocaleDateString("en-IN")
                              : "No Expiry"}
                          </td>
                          <td className="px-8 py-6 font-bold" style={{ color: exp.color }}>
                            {exp.label}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedProducts.map((p) => {
                  const exp = getExpiryInfo(p.Expiry || p.expiryDate);
                  return (
                    <div
                      key={p._id}
                      className="bg-slate-800/80 backdrop-blur-md rounded-xl p-6 shadow-xl border border-slate-700"
                      style={{ borderLeft: `6px solid ${exp.color}` }}
                    >
                      <h3 className="text-xl font-bold mb-4 text-white">{p.itemName || p.Name || "Unnamed Product"}</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-slate-400 block">Supplier</span>
                          <span className="font-medium">{p.stockBroughtBy || "Unknown"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Qty</span>
                          <span className="font-bold text-white">{p.quantity || p.Quantity || 0}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Sale Price</span>
                          ₹{p.salePrice?.toFixed(2) || p.Mrp?.toFixed(2) || "—"}
                        </div>
                        <div>
                          <span className="text-slate-400 block">Purchase Price</span>
                          ₹{p.purchasePrice?.toFixed(2) || "—"}
                        </div>
                        <div>
                          <span className="text-slate-400 block">Expiry</span>
                          {p.Expiry || p.expiryDate
                            ? new Date(p.Expiry || p.expiryDate).toLocaleDateString("en-IN")
                            : "No Expiry"}
                        </div>
                      </div>
                      <div className="font-bold text-lg" style={{ color: exp.color }}>
                        {exp.label}
                      </div>
                      {p.description || p.Description ? (
                        <p className="mt-4 text-slate-300 text-sm border-t border-slate-700 pt-3">
                          {p.description || p.Description}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllProducts;