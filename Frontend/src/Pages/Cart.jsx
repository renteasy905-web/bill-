import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, CheckCircle, AlertCircle, IndianRupee, RefreshCw, ArrowLeft, Pencil } from "lucide-react";
import api from "../utils/api";

const ProductEdit = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);
  const [editedProduct, setEditedProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Calculate total stock value
  const totalStockValue = products.reduce((sum, product) => {
    const purchasePrice = Number(product.purchasePrice || product.purchasePrice) || 0;
    const quantity = Number(product.quantity || product.Quantity) || 0;
    return sum + purchasePrice * quantity;
  }, 0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/allproducts"); // FIXED: correct endpoint
      console.log("Edit Page API Response:", res.data);

      const data = res.data.products || res.data.data || [];
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Search filter (product name + supplier)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }
    const term = searchTerm.toLowerCase();
    setFilteredProducts(
      products.filter((p) =>
        (p.itemName || p.Name || "").toLowerCase().includes(term) ||
        (p.stockBroughtBy || "").toLowerCase().includes(term)
      )
    );
  }, [searchTerm, products]);

  // Toast auto-hide
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
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
        itemName: editedProduct.itemName?.trim() || editedProduct.Name?.trim() || "",
        salePrice: Number(editedProduct.salePrice || editedProduct.Mrp) || 0,
        purchasePrice: Number(editedProduct.purchasePrice) || 0,
        quantity: Number(editedProduct.quantity || editedProduct.Quantity) || 0,
        description: editedProduct.description?.trim() || editedProduct.Description?.trim() || "",
        stockBroughtBy: editedProduct.stockBroughtBy?.trim() || "",
        expiryDate: editedProduct.expiryDate || editedProduct.Expiry || null,
      };

      // Assuming your update route is /products/:id - change if different
      await api.put(`/products/${editId}`, updateData);

      const updatedProducts = products.map((p) =>
        p._id === editId ? { ...p, ...updateData } : p
      );

      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
      showToast("Product updated successfully!", "success");
      cancelEdit();
    } catch (err) {
      console.error("Save error:", err);
      showToast("Failed to save changes. Check console.", "error");
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
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto text-teal-600" size={48} />
          <p className="mt-4 text-gray-600 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <AlertCircle className="mx-auto text-red-500" size={48} />
          <p className="mt-4 text-red-600 font-medium text-lg">{error}</p>
          <button
            onClick={fetchProducts}
            className="mt-6 px-8 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Toast */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div
            className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm text-white font-medium ${
              toast.type === "success"
                ? "bg-gradient-to-r from-green-600 to-emerald-600"
                : "bg-gradient-to-r from-red-600 to-rose-600"
            }`}
          >
            {toast.type === "success" ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                title="Go Back"
              >
                <ArrowLeft size={28} className="text-gray-700 hover:text-teal-600" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Edit Products</h1>
                <p className="text-gray-600 text-sm">Manage medicine inventory</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchProducts}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition font-medium"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
              <div className="bg-teal-50 px-5 py-3 rounded-xl border border-teal-200 shadow-sm">
                <div className="flex items-center gap-2 text-teal-800">
                  <IndianRupee size={20} className="text-teal-600" />
                  <div>
                    <p className="text-xs font-medium">Total Stock Value</p>
                    <p className="text-xl font-bold">
                      ₹{totalStockValue.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search product name or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-4 pl-12 rounded-2xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 text-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none shadow-sm"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
        </div>
      </div>

      {/* Products Grid */}
      <main className="max-w-6xl mx-auto px-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <p className="text-gray-500 text-xl">No products found</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const isEditing = editId === product._id;
              const lowStock = (product.quantity || product.Quantity || 0) <= 10;
              const profit = (product.salePrice || product.Mrp || 0) - (product.purchasePrice || 0);

              return (
                <div
                  key={product._id}
                  className={`bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border-2 ${
                    isEditing ? "border-teal-500" : "border-gray-200"
                  }`}
                >
                  {/* Header */}
                  <div className="p-5 bg-gray-50 border-b">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProduct.itemName || editedProduct.Name || ""}
                        onChange={(e) => handleChange("itemName", e.target.value)}
                        className="w-full px-4 py-3 text-xl font-bold bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Product Name"
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">
                          {product.itemName || product.Name || "Unnamed"}
                        </h2>
                        {lowStock && (
                          <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                            Low ({product.quantity || product.Quantity || 0})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Main Content */}
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Sale Price</p>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editedProduct.salePrice ?? editedProduct.Mrp ?? ""}
                            onChange={(e) => handleChange("salePrice", e.target.value)}
                            className="w-full px-4 py-3 text-2xl font-bold text-teal-700 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
                          />
                        ) : (
                          <p className="text-3xl font-bold text-teal-700">
                            ₹{(product.salePrice ?? product.Mrp ?? 0).toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Stock</p>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editedProduct.quantity ?? editedProduct.Quantity ?? ""}
                            onChange={(e) => handleChange("quantity", e.target.value)}
                            className="w-full px-4 py-3 text-2xl font-bold text-indigo-700 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          />
                        ) : (
                          <p className="text-3xl font-bold text-indigo-700">
                            {product.quantity ?? product.Quantity ?? 0}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 text-base">
                      <div>
                        <p className="text-gray-600">Purchase</p>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editedProduct.purchasePrice ?? ""}
                            onChange={(e) => handleChange("purchasePrice", e.target.value)}
                            className="mt-1 w-full px-3 py-2 text-lg font-medium border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">₹{product.purchasePrice ?? "0"}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-600">Profit</p>
                        <p
                          className={`font-bold ${
                            profit > 0 ? "text-green-600" : profit < 0 ? "text-red-600" : "text-gray-600"
                          }`}
                        >
                          ₹{profit.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Supplier & Expiry */}
                    <div className="grid grid-cols-2 gap-6 text-base">
                      <div>
                        <p className="text-gray-600">Supplier</p>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedProduct.stockBroughtBy ?? ""}
                            onChange={(e) => handleChange("stockBroughtBy", e.target.value)}
                            className="mt-1 w-full px-3 py-2 text-lg font-medium border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
                            placeholder="Supplier name"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">
                            {product.stockBroughtBy || "Unknown"}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-600">Expiry</p>
                        {isEditing ? (
                          <input
                            type="date"
                            value={
                              editedProduct.Expiry || editedProduct.expiryDate
                                ? new Date(editedProduct.Expiry || editedProduct.expiryDate)
                                    .toISOString()
                                    .split("T")[0]
                                : ""
                            }
                            onChange={(e) => handleChange("expiryDate", e.target.value)}
                            className="mt-1 w-full px-3 py-2 text-lg font-medium border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">
                            {product.Expiry || product.expiryDate
                              ? new Date(product.Expiry || product.expiryDate).toLocaleDateString("en-IN")
                              : "No Expiry"}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <p className="text-gray-600">Description</p>
                      {isEditing ? (
                        <textarea
                          value={editedProduct.description ?? editedProduct.Description ?? ""}
                          onChange={(e) => handleChange("description", e.target.value)}
                          className="mt-1 w-full px-3 py-2 text-base border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
                          rows={2}
                          placeholder="Product description"
                        />
                      ) : (
                        <p className="font-medium text-gray-900">
                          {product.description || product.Description || "—"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-5 bg-gray-50 border-t flex justify-end gap-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={cancelEdit}
                          className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEdit}
                          className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition shadow-sm"
                        >
                          Save
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(product)}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md flex items-center gap-2"
                      >
                        <Pencil size={18} />
                        Edit
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
