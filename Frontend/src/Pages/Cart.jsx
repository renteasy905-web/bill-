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
      // Backend returns { success: true, products: [...] }
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load products. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (product) => {
    setEditId(product._id);
    // Use backend field names + add display-friendly ones
    setEditedProduct({
      ...product,
      displayName: product.itemName,
      displaySalePrice: product.salePrice,
      displayPurchasePrice: product.purchasePrice,
      displayQuantity: product.quantity,
    });
  };

  const saveEdit = async () => {
    if (!editId) return;

    try {
      // Prepare data with backend field names
      const updateData = {
        itemName: editedProduct.displayName || editedProduct.itemName,
        salePrice: Number(editedProduct.displaySalePrice) || editedProduct.salePrice,
        purchasePrice: Number(editedProduct.displayPurchasePrice) || editedProduct.purchasePrice,
        quantity: Number(editedProduct.displayQuantity) || editedProduct.quantity,
        // Add other fields if needed (description, expiryDate, etc.)
      };

      // IMPORTANT: Confirm correct PUT endpoint with your backend!
      // Common options: /api/products/:id OR /api/fetch/:id
      await api.put(`/api/fetch/${editId}`, updateData);

      // Update local state
      setProducts((prev) =>
        prev.map((p) =>
          p._id === editId ? { ...p, ...updateData } : p
        )
      );

      setEditId(null);
      setEditedProduct({});
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save. Check console & backend.");
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg">Loading products... (Render may take 10-30s)</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">No products found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
          <button className="text-2xl">←</button>
          <h1 className="text-lg font-semibold">PRODUCT EDIT KAREIN</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        {products.map((product) => {
          const isEditing = editId === product._id;
          const lowStock = product.quantity <= 5;

          return (
            <div
              key={product._id}
              className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Product Name + Low Stock */}
              <div className="p-5 border-b bg-gray-50">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProduct.displayName || ""}
                    onChange={(e) => handleChange("displayName", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-xl font-bold focus:outline-none focus:border-blue-500"
                    placeholder="Item name"
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">{product.itemName || "Unnamed"}</h2>
                    {lowStock && (
                      <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Low Stock
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Main Info */}
              <div className="p-5">
                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                  {/* Sale Price */}
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Sale Price</div>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editedProduct.displaySalePrice || ""}
                        onChange={(e) => handleChange("displaySalePrice", e.target.value)}
                        className="w-full text-center text-xl font-bold border-b focus:outline-none"
                      />
                    ) : (
                      <div className="text-xl font-bold text-green-700">
                        ₹{product.salePrice || "—"}
                      </div>
                    )}
                  </div>

                  {/* Purchase Price */}
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Purchase Price</div>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editedProduct.displayPurchasePrice || ""}
                        onChange={(e) => handleChange("displayPurchasePrice", e.target.value)}
                        className="w-full text-center text-xl font-bold border-b focus:outline-none"
                      />
                    ) : (
                      <div className="text-xl font-bold">
                        ₹{product.purchasePrice || "—"}
                      </div>
                    )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Stock Quantity</div>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editedProduct.displayQuantity || ""}
                        onChange={(e) => handleChange("displayQuantity", e.target.value)}
                        className="w-full text-center text-xl font-bold border-b focus:outline-none"
                      />
                    ) : (
                      <div className="text-xl font-bold">
                        {product.quantity || 0} {product.quantity === 1 ? "unit" : "units"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Stock Value:</span>
                    <span className="font-medium">
                      ₹{(product.salePrice * product.quantity).toFixed(0) || "—"}
                    </span>
                  </div>
                  {/* Add more fields like expiryDate, description if you want */}
                </div>
              </div>

              {/* Edit / Save Buttons */}
              <div className="p-5 bg-gray-50 border-t flex justify-end gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        setEditId(null);
                        setEditedProduct({});
                      }}
                      className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => startEdit(product)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductEdit;
