import React, { useEffect, useState } from "react";
import api from "../utils/api"; // Make sure this is your axios instance

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

  // Fetch products from correct endpoint
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/api/allproducts"); // ← FIXED: added /api/
        console.log("Fetched products:", res.data); // Debug log
        setProducts(res.data.data || res.data.products || []); // Handle both possible structures
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load products. Check your backend or internet.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle window resize for mobile view
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Expiry status logic (from today)
  const getExpiryInfo = (expiryDate) => {
    if (!expiryDate) return { color: "#9ca3af", label: "No Expiry" };

    const expiry = new Date(expiryDate);
    const diffMonths =
      (expiry.getFullYear() - today.getFullYear()) * 12 +
      (expiry.getMonth() - today.getMonth());

    if (diffMonths <= 0) return { color: "#ef4444", label: "EXPIRED" };
    if (diffMonths <= 3) return { color: "#f97316", label: "WITHIN 3 MONTHS" };
    if (diffMonths <= 6) return { color: "#eab308", label: "WITHIN 6 MONTHS" };
    return { color: "#22c55e", label: "SAFE (>6 MONTHS)" };
  };

  // Sort by nearest expiry (earliest first)
  const sortedProducts = [...products].sort((a, b) => {
    const dateA = a.expiryDate ? new Date(a.expiryDate) : new Date("9999-12-31");
    const dateB = b.expiryDate ? new Date(b.expiryDate) : new Date("9999-12-31");
    return dateA - dateB;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-red-500 text-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-6 md:p-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-indigo-400">
          Vishwas Medical Inventory
        </h1>
        <p className="text-center text-lg md:text-xl text-slate-300 mb-10">
          Current Date: <strong className="text-white">{todayFormatted}</strong>
        </p>

        {sortedProducts.length === 0 ? (
          <div className="text-center text-xl text-slate-400 py-20">
            No products found in inventory
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            {!isMobile && (
              <div className="overflow-x-auto bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
                <table className="w-full text-left">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-5 font-semibold">Item Name</th>
                      <th className="px-6 py-5 font-semibold">Description</th>
                      <th className="px-6 py-5 font-semibold">Quantity</th>
                      <th className="px-6 py-5 font-semibold">Sale Price</th>
                      <th className="px-6 py-5 font-semibold">Purchase Price</th>
                      <th className="px-6 py-5 font-semibold">Expiry Date</th>
                      <th className="px-6 py-5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProducts.map((p) => {
                      const exp = getExpiryInfo(p.expiryDate);
                      return (
                        <tr
                          key={p._id}
                          className="border-b border-slate-700 hover:bg-slate-700/50 transition"
                          style={{ backgroundColor: `${exp.color}22` }} // light tint
                        >
                          <td className="px-6 py-5 font-medium">{p.itemName}</td>
                          <td className="px-6 py-5">{p.description || "-"}</td>
                          <td className="px-6 py-5">{p.quantity}</td>
                          <td className="px-6 py-5">₹{p.salePrice}</td>
                          <td className="px-6 py-5">₹{p.purchasePrice}</td>
                          <td className="px-6 py-5">
                            {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString("en-IN") : "No Expiry"}
                          </td>
                          <td className="px-6 py-5 font-bold" style={{ color: exp.color }}>
                            {exp.label}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Mobile Card View */}
            {isMobile && (
              <div className="space-y-6">
                {sortedProducts.map((p) => {
                  const exp = getExpiryInfo(p.expiryDate);
                  return (
                    <div
                      key={p._id}
                      className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700"
                      style={{ borderLeft: `6px solid ${exp.color}` }}
                    >
                      <h3 className="text-xl font-bold mb-3">{p.itemName}</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Quantity:</span>
                          <p className="font-medium">{p.quantity}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Sale Price:</span>
                          <p className="font-medium">₹{p.salePrice}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Purchase:</span>
                          <p className="font-medium">₹{p.purchasePrice}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Expiry:</span>
                          <p className="font-medium">
                            {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString("en-IN") : "No Expiry"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 font-bold text-lg" style={{ color: exp.color }}>
                        Status: {exp.label}
                      </div>
                      {p.description && (
                        <p className="mt-3 text-slate-300 text-sm">{p.description}</p>
                      )}
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
