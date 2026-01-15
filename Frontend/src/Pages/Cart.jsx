import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  IndianRupee,
  RefreshCw,
  ArrowLeft,
  Pencil,
  AlertTriangle,
} from "lucide-react";
import api from "../utils/api";

const Cart = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editedProduct, setEditedProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  /* ---------------- FETCH ---------------- */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");

      const productList = res.data.products || res.data || [];
      setProducts(
        productList.map((p) => ({
          _id: p._id,
          itemName: p.itemName || "Unnamed Product",
          salePrice: Number(p.salePrice ?? 0),
          purchasePrice: Number(p.purchasePrice ?? 0),
          quantity: Number(p.quantity ?? 0),
        }))
      );
      setError("");
    } catch (err) {
      console.error("Fetch products error:", err);
      setError("Failed to fetch products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ---------------- TOAST ---------------- */
  useEffect(() => {
    if (!toast.show) return;
    const t = setTimeout(() => setToast({ show: false }), 3000);
    return () => clearTimeout(t);
  }, [toast.show]);

  const showToast = (message, type = "success") =>
    setToast({ show: true, message, type });

  /* ---------------- EDIT ---------------- */
  const startEdit = (p) => {
    setEditId(p._id);
    setEditedProduct({
      itemName: p.itemName,
      salePrice: p.salePrice ?? 0,
      purchasePrice: p.purchasePrice ?? 0,
      quantity: p.quantity ?? 0,
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditedProduct({});
  };

  const handleChange = (field, value) => {
    if ((field === "quantity" || field === "salePrice") && value < 0) return;

    setEditedProduct((prev) => ({ ...prev, [field]: value }));
  };

  /* ---------------- SAVE ---------------- */
  const saveEdit = async () => {
    if (!editedProduct.itemName?.trim()) {
      showToast("Item name is required", "error");
      return;
    }

    try {
      const res = await api.put(`/products/${editId}`, {
        itemName: editedProduct.itemName.trim(),
        salePrice: Number(editedProduct.salePrice || 0),
        purchasePrice: Number(editedProduct.purchasePrice || 0),
        quantity: Number(editedProduct.quantity || 0),
      });

      const updated = res.data.product;

      setProducts((prev) =>
        prev.map((p) => (p._id === editId ? { ...p, ...updated } : p))
      );

      showToast("Product updated successfully");
      cancelEdit();
    } catch (err) {
      console.error("Update error:", err);
      showToast(
        err.response?.data?.message || "Failed to update product",
        "error"
      );
    }
  };

  const totalStockValue = products.reduce(
    (sum, p) => sum + p.purchasePrice * p.quantity,
    0
  );

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 text-red-700 text-xl p-6 text-center">
        <AlertCircle size={64} className="mb-6 text-red-500" />
        {error}
        <button
          onClick={fetchProducts}
          className="mt-6 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-50 animate-fade-in">
          <div
            className={`px-6 py-4 rounded-xl shadow-2xl text-white flex items-center gap-3 max-w-sm ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={24} />
            ) : (
              <AlertCircle size={24} />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm p-5 flex justify-between items-center sticky top-0 z-10">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <ArrowLeft size={28} className="text-gray-700" />
        </button>

        <div className="flex items-center gap-4 font-semibold text-lg">
          <RefreshCw
            onClick={fetchProducts}
            className="cursor-pointer hover:text-indigo-600 transition"
            size={22}
          />
          <IndianRupee className="text-green-600" />
          <span className="text-gray-800">
            {totalStockValue.toLocaleString("en-IN")}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-5 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <IndianRupee className="text-indigo-600" size={32} />
          Inventory Management
        </h1>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md border border-gray-200">
            <AlertCircle size={64} className="mx-auto text-gray-400 mb-6" />
            <p className="text-xl text-gray-600 font-medium">
              No products found in inventory
            </p>
            <p className="text-gray-500 mt-2">
              Add new products from the "New Product" section
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => {
              const isEditing = editId === p._id;
              const lowStock = p.quantity < 5;
              const outOfStock = p.quantity === 0;

              return (
                <div
                  key={p._id}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden border transition-all duration-200 ${
                    outOfStock
                      ? "border-red-400 bg-red-50/30"
                      : lowStock
                      ? "border-yellow-400"
                      : "border-gray-200 hover:border-indigo-300 hover:shadow-xl"
                  }`}
                >
                  {/* Header */}
                  <div className="p-5 border-b bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
                    {isEditing ? (
                      <input
                        value={editedProduct.itemName}
                        onChange={(e) => handleChange("itemName", e.target.value)}
                        className="text-xl font-bold w-full px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Product Name"
                      />
                    ) : (
                      <h3 className="text-xl font-bold text-gray-900 truncate max-w-[70%]">
                        {p.itemName}
                      </h3>
                    )}

                    <div className="flex items-center gap-2">
                      {lowStock && (
                        <AlertTriangle className="text-yellow-600" size={22} />
                      )}
                      {outOfStock && (
                        <AlertTriangle className="text-red-600" size={22} />
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-5">
                    {/* Sale Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Sale Price (₹)
                      </label>
                      <input
                        type="number"
                        disabled={!isEditing}
                        value={isEditing ? editedProduct.salePrice : p.salePrice}
                        onChange={(e) => handleChange("salePrice", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 font-medium text-lg disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          isEditing ? "border-indigo-400" : "border-gray-300"
                        }`}
                      />
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        disabled={!isEditing}
                        value={isEditing ? editedProduct.quantity : p.quantity}
                        onChange={(e) => handleChange("quantity", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg font-bold text-lg text-center disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          outOfStock
                            ? "text-red-600 border-red-400"
                            : lowStock
                            ? "text-yellow-700 border-yellow-400"
                            : "text-gray-900 border-gray-300"
                        } ${isEditing ? "border-indigo-400" : ""}`}
                      />
                      {outOfStock && (
                        <p className="text-red-600 text-sm mt-1 font-medium">
                          Out of stock
                        </p>
                      )}
                      {lowStock && !outOfStock && (
                        <p className="text-yellow-700 text-sm mt-1 font-medium">
                          Low stock – reorder soon
                        </p>
                      )}
                    </div>

                    {/* Purchase Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Purchase Price (₹)
                      </label>
                      <input
                        type="number"
                        disabled={!isEditing}
                        value={
                          isEditing ? editedProduct.purchasePrice : p.purchasePrice
                        }
                        onChange={(e) => handleChange("purchasePrice", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 font-medium disabled:bg-gray-100 disabled:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          isEditing ? "border-indigo-400" : "border-gray-300"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Actions - DELETE BUTTON REMOVED */}
                  <div className="p-5 border-t bg-gray-50 flex justify-end">
                    {isEditing ? (
                      <>
                        <button
                          onClick={cancelEdit}
                          className="px-6 py-2.5 mr-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEdit}
                          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition flex items-center gap-2 shadow-sm"
                        >
                          <CheckCircle size={18} />
                          Save
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(p)}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition flex items-center gap-2 shadow-sm"
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

export default Cart;