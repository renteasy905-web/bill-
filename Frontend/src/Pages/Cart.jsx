import React, { useState, useEffect } from "react";
import api from "../utils/api";

const ProductEdit = () => {
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editedProduct, setEditedProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/fetch");
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (product) => {
    setEditId(product._id);
    setEditedProduct({ ...product });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditedProduct({});
  };

  const saveEdit = async () => {
    if (!editId) return;
    try {
      const updateData = {
        itemName: editedProduct.itemName,
        salePrice: Number(editedProduct.salePrice),
        purchasePrice: Number(editedProduct.purchasePrice),
        quantity: Number(editedProduct.quantity),
        // Add expiryDate, description if you want to edit them
      };

      await api.put(`/api/fetch/${editId}`, updateData); // Change route if backend uses different

      setProducts((prev) =>
        prev.map((p) => (p._id === editId ? { ...p, ...updateData } : p))
      );

      setEditId(null);
      setEditedProduct({});
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save changes. Check console.");
    }
  };

  const handleChange = (field, value) => {
    setEditedProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <p className="text-red-600 font-medium text-lg bg-white p-6 rounded-2xl shadow-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10 backdrop-blur-md bg-opacity-90">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button className="text-2xl text-gray-700 hover:text-gray-900 transition">←</button>
          <h1 className="text-xl font-bold text-gray-900">PRODUCT EDIT KAREIN</h1>
          <div className="w-8"></div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-md">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const isEditing = editId === product._id;
              const lowStock = product.quantity <= 10;
              const stockValue = (product.salePrice * product.quantity).toFixed(0);

              return (
                <div
                  key={product._id}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border ${
                    isEditing ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
                  }`}
                >
                  {/* Product Header */}
                  <div className="p-5 bg-gradient-to-r from-gray-50 to-white border-b">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProduct.itemName || ""}
                        onChange={(e) => handleChange("itemName", e.target.value)}
                        className="w-full px-4 py-3 text-xl font-bold bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Product Name"
                      />
                    ) : (
                      <div className="flex items-start justify-between">
                        <h2 className="text-xl font-bold text-gray-900">{product.itemName || "Unnamed Product"}</h2>
                        {lowStock && (
                          <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                            Low Stock ({product.quantity})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Main Content */}
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Sale Price */}
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">Sale Price</p>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editedProduct.salePrice || ""}
                            onChange={(e) => handleChange("salePrice", e.target.value)}
                            className="w-full px-4 py-3 text-2xl font-bold text-green-600 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <p className="text-3xl font-bold text-green-600">₹{product.salePrice || "—"}</p>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">Stock</p>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editedProduct.quantity || ""}
                            onChange={(e) => handleChange("quantity", e.target.value)}
                            className="w-full px-4 py-3 text-2xl font-bold text-blue-600 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-3xl font-bold text-blue-600">{product.quantity || 0}</p>
                        )}
                      </div>
                    </div>

                    {/* Purchase Price & Stock Value */}
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <p className="text-gray-500">Purchase Price</p>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editedProduct.purchasePrice || ""}
                            onChange={(e) => handleChange("purchasePrice", e.target.value)}
                            className="mt-1 w-full px-3 py-2 text-lg font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">₹{product.purchasePrice || "—"}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-500">Stock Value</p>
                        <p className="font-medium text-gray-900">₹{stockValue}</p>
                      </div>
                    </div>

                    {/* Description / Expiry (optional) */}
                    {product.description && (
                      <p className="text-sm text-gray-600 italic border-l-4 border-gray-300 pl-3">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="p-5 bg-gray-50 border-t flex justify-end gap-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={cancelEdit}
                          className="px-6 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEdit}
                          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-md"
                        >
                          Save Changes
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(product)}
                        className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition shadow-md flex items-center gap-2"
                      >
                        <span>✏️ Edit</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductEdit;
