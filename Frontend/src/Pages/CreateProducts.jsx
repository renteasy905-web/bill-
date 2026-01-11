import React, { useState } from "react";
import api from "../utils/api";

const CreateProducts = () => {
  const [formData, setFormData] = useState({
    itemName: "",
    salePrice: "",
    purchasePrice: "",
    quantity: "",
    description: "",
    expiryDate: "",
  });

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
    setLoading(true);
    setSuccess("");
    setError("");

    if (!formData.itemName || !formData.salePrice || !formData.purchasePrice || !formData.quantity) {
      setError("Please fill all required fields");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        itemName: formData.itemName.trim(),
        salePrice: Number(formData.salePrice),
        purchasePrice: Number(formData.purchasePrice),
        quantity: Number(formData.quantity),
        description: formData.description.trim() || "",
        expiryDate: formData.expiryDate || null,
      };

      await api.post("/api/products", payload); // ← Correct path with /api/

      setSuccess("Product added successfully!");
      setFormData({
        itemName: "",
        salePrice: "",
        purchasePrice: "",
        quantity: "",
        description: "",
        expiryDate: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add product");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-indigo-400 tracking-tight">
          Vishwas Medical
        </h1>
        <p className="text-center text-lg text-slate-300 mb-12">
          Add New Product to Inventory
        </p>

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
              {/* Item Name */}
              <div>
                <label className="block text-slate-300 font-medium mb-2">
                  Item Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Paracetamol 500mg"
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
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-5 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
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
                    className="w-full px-5 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
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
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-5 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="500"
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
                  className="w-full px-5 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Pain relief tablets..."
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
                  className="w-full px-5 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

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
