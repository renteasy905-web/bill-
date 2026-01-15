// src/Pages/CreateProducts.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { ArrowLeft, RefreshCw } from "lucide-react";

const CreateProducts = () => {
  const navigate = useNavigate();

  const initialFormData = {
    itemName: "",
    salePrice: "",
    purchasePrice: "",
    quantity: "",
    description: "",
    expiryDate: "",
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

    // Basic client-side validation
    if (!formData.itemName.trim()) {
      setError("Product name is required");
      return;
    }
    if (!formData.salePrice || Number(formData.salePrice) < 0) {
      setError("Valid sale price (≥ 0) is required");
      return;
    }
    if (!formData.purchasePrice || Number(formData.purchasePrice) < 0) {
      setError("Valid purchase price (≥ 0) is required");
      return;
    }
    if (!formData.quantity || Number(formData.quantity) < 0) {
      setError("Valid quantity (≥ 0) is required");
      return;
    }
    if (!formData.stockBroughtBy.trim()) {
      setError("Supplier name is required");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        itemName: formData.itemName.trim(),
        salePrice: Number(formData.salePrice),
        purchasePrice: Number(formData.purchasePrice),
        quantity: Number(formData.quantity),
        description: formData.description.trim() || undefined,
        expiryDate: formData.expiryDate ? formData.expiryDate : null,
        stockBroughtBy: formData.stockBroughtBy.trim(),
      };

      const response = await api.post("/products", payload);

      setSuccess("Product added successfully! ✓");
      setFormData(initialFormData); // reset form
    } catch (err) {
      console.error("PRODUCT CREATION ERROR:", err);

      let errorMessage = "Failed to add product. Please try again.";

      if (err.response?.data?.message) {
        const msg = err.response.data.message;

        if (msg.includes("duplicate key") || msg.includes("E11000")) {
          errorMessage = `Product "${formData.itemName}" already exists!`;
        } else if (msg.includes("required")) {
          errorMessage = msg; // Let mongoose tell user exactly what's missing
        } else if (msg.includes("Cast to date")) {
          errorMessage = "Invalid expiry date format";
        } else {
          errorMessage = msg;
        }
      } else if (err.request) {
        errorMessage = "No response from server. Is backend running?";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setFormData(initialFormData);
    setSuccess("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
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

        {/* Form Card */}
        <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 border border-slate-700">
          {success && (
            <div className="mb-8 p-4 bg-green-900/40 border border-green-600 text-green-300 rounded-lg text-center font-medium">
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
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  placeholder="Paracetamol 500mg"
                  required
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
                  className="w-full px-5 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  placeholder="Distributor XYZ / Mr. Ramesh"
                  required
                />
              </div>

              {/* Prices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-300 font-medium mb-2">
                    Sale Price (₹) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="salePrice"
                    value={formData.salePrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-5 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    placeholder="50.00"
                    required
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
                    min="0"
                    step="0.01"
                    className="w-full px-5 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    placeholder="35.00"
                    required
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
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-5 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  placeholder="500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
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
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-5 px-8 text-xl font-bold rounded-xl transition-all duration-300 shadow-lg ${
                  loading
                    ? "bg-slate-600 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 hover:shadow-indigo-500/30"
                }`}
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
