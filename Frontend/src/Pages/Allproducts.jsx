// src/components/AllProducts.jsx
import React, { useEffect, useState } from "react";
import api from "../utils/api";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const today = new Date();
  const todayFormatted = today.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Correct endpoint
        const res = await api.get("/api/allproducts");

        console.log("API Response:", res.data); // Debug

        const productList = res.data.data || res.data.products || res.data.allproducts || res.data || [];
        setProducts(Array.isArray(productList) ? productList : []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent zoom (additional CSS + meta handling)
  useEffect(() => {
    // Add meta tag dynamically if needed (most browsers respect viewport)
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      );
    }
  }, []);

  // Expiry info with colors
  const getExpiryInfo = (expiryDate) => {
    if (!expiryDate) return { color: "#9ca3af", label: "No Expiry" };
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { color: "#ef4444", label: "EXPIRED" };
    if (diffDays <= 90) return { color: "#f97316", label: "≤ 3 Months" };
    if (diffDays <= 180) return { color: "#eab308", label: "≤ 6 Months" };
    return { color: "#22c55e", label: "Safe" };
  };

  const sortedProducts = [...products].sort((a, b) => {
    const da = a.expiryDate ? new Date(a.expiryDate) : new Date("9999-12-31");
    const db = b.expiryDate ? new Date(b.expiryDate) : new Date("9999-12-31");
    return da - db;
  });

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white"
      style={{ touchAction: "manipulation" }} // Helps prevent zoom on touch
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-400 mb-3">
            Vishwas Medical Inventory
          </h1>
          <p className="text-lg md:text-xl text-slate-300">
            Today: <strong className="text-white">{todayFormatted}</strong>
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xl text-slate-300">Loading inventory...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-900/40 border border-red-600 text-red-300 p-6 rounded-xl text-center max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {/* Products */}
        {!loading && !error && (
          <>
            {sortedProducts.length === 0 ? (
              <div className="text-center py-20 text-xl text-slate-400 bg-slate-800/50 rounded-2xl">
                No products found in inventory yet
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
                          <th className="px-8 py-6 font-semibold text-indigo-300">Description</th>
                          <th className="px-8 py-6 font-semibold text-indigo-300">Qty</th>
                          <th className="px-8 py-6 font-semibold text-indigo-300">Sale Price</th>
                          <th className="px-8 py-6 font-semibold text-indigo-300">Purchase Price</th>
                          <th className="px-8 py-6 font-semibold text-indigo-300">Expiry</th>
                          <th className="px-8 py-6 font-semibold text-indigo-300">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedProducts.map((p) => {
                          const exp = getExpiryInfo(p.expiryDate);
                          return (
                            <tr
                              key={p._id}
                              className="border-b border-slate-700 hover:bg-slate-700/50 transition-all duration-200"
                            >
                              <td className="px-8 py-6 font-medium">{p.itemName}</td>
                              <td className="px-8 py-6 text-slate-300">{p.description || "—"}</td>
                              <td className="px-8 py-6">{p.quantity}</td>
                              <td className="px-8 py-6">₹{p.salePrice?.toFixed(2) || "—"}</td>
                              <td className="px-8 py-6">₹{p.purchasePrice?.toFixed(2) || "—"}</td>
                              <td className="px-8 py-6">
                                {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString("en-IN") : "No Expiry"}
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
                  // Mobile Cards
                  <div className="space-y-6">
                    {sortedProducts.map((p) => {
                      const exp = getExpiryInfo(p.expiryDate);
                      return (
                        <div
                          key={p._id}
                          className="bg-slate-800/80 backdrop-blur-md rounded-xl p-6 shadow-xl border border-slate-700"
                          style={{ borderLeft: `6px solid ${exp.color}` }}
                        >
                          <h3 className="text-xl font-bold mb-4 text-white">{p.itemName}</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                              <span className="text-slate-400 block">Qty</span>
                              {p.quantity}
                            </div>
                            <div>
                              <span className="text-slate-400 block">Sale</span>
                              ₹{p.salePrice?.toFixed(2) || "—"}
                            </div>
                            <div>
                              <span className="text-slate-400 block">Purchase</span>
                              ₹{p.purchasePrice?.toFixed(2) || "—"}
                            </div>
                            <div>
                              <span className="text-slate-400 block">Expiry</span>
                              {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString("en-IN") : "No Expiry"}
                            </div>
                          </div>
                          <div className="font-bold text-lg" style={{ color: exp.color }}>
                            {exp.label}
                          </div>
                          {p.description && (
                            <p className="mt-4 text-slate-300 text-sm border-t border-slate-700 pt-3">
                              {p.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllProducts;
