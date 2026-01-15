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
      !formData.quantity ||
      !formData.salePrice
    ) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      // ✅ BACKEND-COMPATIBLE PAYLOAD
      const payload = {
        itemName: formData.itemName.trim(),     // ✅ REQUIRED
        quantity: Number(formData.quantity),    // ✅ REQUIRED
        salePrice: Number(formData.salePrice),
        purchasePrice: Number(formData.purchasePrice),
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
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <h1 className="text-3xl font-bold text-indigo-400">
            Add Product
          </h1>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded"
          >
            <RefreshCw size={18} /> Reset
          </button>
        </div>

        {success && (
          <div className="mb-4 bg-green-800 p-3 rounded text-center">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-800 p-3 rounded text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            placeholder="Product Name"
            required
            className="w-full p-3 bg-slate-800 rounded"
          />

          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            required
            className="w-full p-3 bg-slate-800 rounded"
          />

          <input
            type="number"
            name="salePrice"
            value={formData.salePrice}
            onChange={handleChange}
            placeholder="Sale Price"
            className="w-full p-3 bg-slate-800 rounded"
          />

          <input
            type="number"
            name="purchasePrice"
            value={formData.purchasePrice}
            onChange={handleChange}
            placeholder="Purchase Price"
            className="w-full p-3 bg-slate-800 rounded"
          />

          <input
            type="text"
            name="stockBroughtBy"
            value={formData.stockBroughtBy}
            onChange={handleChange}
            placeholder="Supplier"
            className="w-full p-3 bg-slate-800 rounded"
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full p-3 bg-slate-800 rounded"
          />

          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            className="w-full p-3 bg-slate-800 rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded font-bold"
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProducts;
