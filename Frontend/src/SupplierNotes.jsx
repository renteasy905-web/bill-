import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { ArrowLeft, DollarSign, Package, Calendar } from "lucide-react";

const SupplierNotes = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get("/suppliers/summary");
        setSuppliers(res.data.suppliers || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load supplier data");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const formatIndianCurrency = (num) => {
    return Number(num).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
      style: "currency",
      currency: "INR"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-6 py-3 bg-slate-700/70 hover:bg-slate-600 rounded-xl transition"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-400">
            Supplier Notes & Pending
          </h1>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-900/40 border border-red-600 rounded-xl text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xl">
            No suppliers found yet...
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((sup, index) => (
              <div
                key={index}
                className="bg-slate-800/70 backdrop-blur-lg rounded-2xl p-7 border border-slate-700 shadow-xl hover:shadow-indigo-900/30 transition-all"
              >
                <h2 className="text-2xl font-bold text-indigo-300 mb-5">
                  {sup.supplier}
                </h2>

                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-900/40 rounded-lg">
                      <DollarSign size={28} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Total Pending</p>
                      <p className="text-2xl font-bold">
                        {formatIndianCurrency(sup.totalPendingAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-900/40 rounded-lg">
                      <Package size={28} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Products in Stock</p>
                      <p className="text-xl font-semibold">{sup.productsCount}</p>
                    </div>
                  </div>

                  {sup.lastStockDate && (
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-900/40 rounded-lg">
                        <Calendar size={28} className="text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Last Stock Date</p>
                        <p className="text-lg">
                          {new Date(sup.lastStockDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierNotes;
