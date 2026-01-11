import React, { useState, useEffect } from "react";
import api from "../utils/api";

const ProductEdit = () => {
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editedProduct, setEditedProduct] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/fetch");
      setProducts(res.data.t || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (product) => {
    setEditId(product._id);
    setEditedProduct({ ...product });
  };

  const saveEdit = async () => {
    try {
      await api.put(`/fetch/${editId}`, editedProduct);
      
      setProducts((prev) =>
        prev.map((p) => (p._id === editId ? { ...editedProduct } : p))
      );
      
      setEditId(null);
      setEditedProduct({});
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (field, value) => {
    setEditedProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Only showing first product in edit mode for simplicity (like screenshot)
  // You can loop through all products if needed
  const product = products[0]; // ← change to map if you want all products

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (!product) return <div className="p-4 text-center">No product found</div>;

  const isEditing = editId === product._id;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button className="text-2xl">←</button>
          <h1 className="text-lg font-semibold">PRODUCT EDIT KAREIN</h1>
          <div className="w-8" /> {/* spacer */}
        </div>
      </div>

      <div className="p-4">
        {/* Product Name + Low Stock Tag */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-1">Item Ka Naam</div>
          {isEditing ? (
            <input
              type="text"
              value={editedProduct.Name || ""}
              onChange={(e) => handleChange("Name", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg font-medium focus:outline-none focus:border-blue-500"
              placeholder="Product name"
            />
          ) : (
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{product.Name || "gram flour soap"}</h2>
              {Number(product.Quantity) <= 5 && (
                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Low Stock
                </span>
              )}
            </div>
          )}
        </div>

        {/* Main Grid - Prices & Quantity */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <div>
              <div className="text-sm text-gray-500">Sale Price</div>
              {isEditing ? (
                <input
                  type="number"
                  value={editedProduct.SalePrice || editedProduct.Mrp || ""}
                  onChange={(e) => handleChange("SalePrice", Number(e.target.value))}
                  className="w-full mt-1 text-center text-xl font-bold border-b focus:outline-none"
                />
              ) : (
                <div className="text-xl font-bold text-green-700">
                  ₹{product.SalePrice || product.Mrp || "160"}
                </div>
              )}
            </div>

            <div>
              <div className="text-sm text-gray-500">Purchase Price</div>
              {isEditing ? (
                <input
                  type="number"
                  value={editedProduct.PurchasePrice || ""}
                  onChange={(e) => handleChange("PurchasePrice", Number(e.target.value))}
                  className="w-full mt-1 text-center text-xl font-bold border-b focus:outline-none"
                />
              ) : (
                <div className="text-xl font-bold">₹{product.PurchasePrice || "120"}</div>
              )}
            </div>

            <div>
              <div className="text-sm text-gray-500">Stock Quantity</div>
              {isEditing ? (
                <input
                  type="number"
                  value={editedProduct.Quantity || ""}
                  onChange={(e) => handleChange("Quantity", Number(e.target.value))}
                  className="w-full mt-1 text-center text-xl font-bold border-b focus:outline-none"
                />
              ) : (
                <div className="text-xl font-bold">
                  {product.Quantity || "2"} BOX
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Stock Value</span>
              <span className="font-medium">
                ₹{(product.SalePrice || 160) * (product.Quantity || 2) || "320"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Primary Unit</span>
              <span className="font-medium">BOX</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Secondary Unit</span>
              <span className="font-medium">(+)Jodein</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Low Stock Alert</span>
              <span className="font-medium">{product.LowStockThreshold || "2 BOX"}</span>
            </div>
          </div>
        </div>

        {/* This Week Profit (like screenshot bottom section) */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="text-sm text-gray-500 mb-3">Iss hafte ka total profit</div>
          
          <div className="flex items-end gap-4">
            <div>
              <div className="text-3xl font-bold text-green-700">₹40</div>
              <div className="text-xs text-gray-500">Total Profit Amount</div>
            </div>
            
            <div className="text-2xl font-bold text-gray-400">|</div>
            
            <div>
              <div className="text-3xl font-bold">1</div>
              <div className="text-xs text-gray-500">Stocks Sold</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="fixed bottom-6 left-4 right-4">
            <button
              onClick={saveEdit}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductEdit;
