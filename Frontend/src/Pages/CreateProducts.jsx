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

    if (
      !formData.itemName.trim() ||
      !formData.salePrice ||
      !formData.purchasePrice ||
      !formData.quantity ||
      !formData.stockBroughtBy.trim()
    ) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      // ✅ IMPORTANT FIX: Map itemName ➜ Name
      const payload = {
        Name: formData.itemName.trim(), // 🔥 FIX HERE
        salePrice: Number(formData.salePrice),
        purchasePrice: Number(formData.purchasePrice),
        quantity: Number(formData.quantity),
        description: formData.description.trim() || "",
        expiryDate: formData.expiryDate || null,
        stockBroughtBy: formData.stockBroughtBy.trim(),
      };

      await api.post("/products", payload);

      setSuccess("Product added successfully!");
      setFormData(initialFormData);
    } catch (err) {
      console.error("Error adding product:", err);
      setError(
        err.response?.data?.message ||
          "Failed to add product. Please try again."
      );
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-700/70 hover:bg-slate-600 rounded-lg"
          >
            <ArrowLeft size={20} /> Back
          </button>

          <div className="text-center flex-1">
            <h1 className="text-4xl font-extrabold text-indigo-400">
              Vishwas Medical
            </h1>
            <p className="text-slate-300">Add New Product</p>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600/70 hover:bg-indigo-600 rounded-lg"
          >
            <RefreshCw size={18} /> Refresh
          </button>
        </div>

        <div className="bg-slate-800/80 rounded-2xl shadow-2xl p-8 border border-slate-700">
          {success && (
            <div className="mb-6 p-4 bg-green-900/40 text-green-300 rounded-lg text-center">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-900/40 text-red-300 rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              name="itemName"
              value={formData.itemName}
              onChange={handleChange}
              placeholder="Product Name"
              required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg"
            />

            <input
              type="text"
              name="stockBroughtBy"
              value={formData.stockBroughtBy}
              onChange={handleChange}
              placeholder="Supplier"
              required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg"
            />

            <input
              type="number"
              name="salePrice"
              value={formData.salePrice}
              onChange={handleChange}
              placeholder="Sale Price"
              required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg"
            />

            <input
              type="number"
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleChange}
              placeholder="Purchase Price"
              required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg"
            />

            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Quantity"
              required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg"
            />

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description (optional)"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg"
            />

            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold"
            >
              {loading ? "Adding..." : "Add Product"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProducts;
