// src/Pages/CreateProducts.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { ArrowLeft, RefreshCw } from "lucide-react";

const CreateProducts = () => {
  const navigate = useNavigate();

  // Initial form state
  const initialFormData = {
    Name: "",
    Mrp: "",
    purchasePrice: "",
    Quantity: "",
    Description: "",
    Expiry: "",
    stockBroughtBy: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    // Basic validation
    if (
      !formData.Name.trim() ||
      !formData.Mrp ||
      !formData.purchasePrice ||
      !formData.Quantity ||
      !formData.stockBroughtBy.trim()
    ) {
      setError("Please fill all required fields (including Supplier)");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        Name: formData.Name.trim(),
        Mrp: Number(formData.Mrp),
        purchasePrice: Number(formData.purchasePrice),
        Quantity: Number(formData.Quantity),
        Description: formData.Description.trim() || "",
        Expiry: formData.Expiry || null,
        stockBroughtBy: formData.stockBroughtBy.trim(),
      };

      // FIXED: Correct endpoint (no extra /api prefix)
      await api.post("/products", payload);

      setSuccess("Product added successfully!");
      setFormData(initialFormData); // Reset form
    } catch (err) {
      console.error("Error adding product:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to add product. Please check your connection or try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Reset form only (no page reload)
  const handleRefresh = () => {
    setFormData(initialFormData);
    setSuccess("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Top Bar: Back + Title + Refresh */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-700/70 hover:bg-slate-600 rounded-lg text-white transition-all shadow-md"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="text-center flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-400 mb-2">
              Vishwas Medical
            </h1>
            <p className="text-lg text-slate-300">Add New Product to Inventory</p>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600/70 hover:bg-indigo-600 rounded-lg text-white transition-all shadow-md"
          >
            <RefreshCw size={18} />
            Refresh Form
          </button>
        </div>

        {/* Main Form Card */}
        <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 border border-slate-700">
          {success && (
            <div className="mb-8 p-4 bg-green-900/40 border border-green-600 text-green-300 rounded-lg text-center">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-8 p-4 bg-red-900/40 border border-red-600 text-red-300 rounded-lg text-center">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-xl text-slate-300">Adding product...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Product Name */}
              <div>
                <label className="block text-slate-300 font-medium mb-2">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="Name"
                  value={formData.Name}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  placeholder="Paracetamol 500mg"
                />
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-slate-300 font-medium mb-2">
                  Stock Brought By / Supplier <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="stockBroughtBy"
                  value={formData.stockBroughtBy}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  placeholder="Distributor XYZ / Mr. Ramesh"
                />
              </div>

              {/* Prices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-300 font-medium mb-2">
                    Sale Price (MRP ₹) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="Mrp"
                    value={formData.Mrp}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-5 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    placeholder="50.00"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">
                    Purchase Price (₹) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-5 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    placeholder="35.00"
                  />
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-slate-300 font-medium mb-2">
                  Quantity <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="Quantity"
                  value={formData.Quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-5 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  placeholder="500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="Description"
                  value={formData.Description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-5 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  placeholder="Pain relief tablets, 10 strips..."
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-slate-300 font-medium mb-2">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  name="Expiry"
                  value={formData.Expiry}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-5 px-8 text-xl font-bold rounded-xl transition-all duration-300 shadow-lg
                  ${loading ? "bg-slate-600 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 hover:shadow-indigo-500/30"}`}
              >
                {loading ? "Adding Product..." : "Add Product"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateProducts;
