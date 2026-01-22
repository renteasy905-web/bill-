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

  useEffect(() => {
    if (!toast.show) return;
    const timer = setTimeout(() => setToast({ show: false }), 3000);
    return () => clearTimeout(timer);
  }, [toast.show]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

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
    if ((field === "quantity" || field === "salePrice" || field === "purchasePrice") && value < 0) {
      return;
    }
    setEditedProduct((prev) => ({ ...prev, [field]: value }));
  };

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

      const updated = res.data.product || res.data;
      setProducts((prev) =>
        prev.map((p) => (p._id === editId ? { ...p, ...updated } : p))
      );

      showToast("Product updated successfully");
      cancelEdit();
    } catch (err) {
      console.error("Update error:", err);
      showToast(err.response?.data?.message || "Failed to update product", "error");
    }
  };

  const totalStockValue = products.reduce(
    (sum, p) => sum + (p.purchasePrice * p.quantity),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background text-destructive text-xl p-6 text-center">
        <AlertCircle size={64} className="mb-6 text-destructive" />
        {error}
        <button
          onClick={fetchProducts}
          className="mt-6 px-8 py-4 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-primary/90 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Toast */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-50 animate-fadeIn">
          <div
            className={`px-6 py-4 rounded-xl shadow-2xl text-white flex items-center gap-3 max-w-sm ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.type === "success" ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-card shadow-sm p-5 flex justify-between items-center sticky top-0 z-10 border-b border-border">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full hover:bg-muted transition"
        >
          <ArrowLeft size={28} className="text-foreground" />
        </button>

        <h1 className="text-2xl font-bold text-primary">Inventory Management</h1>

        <div className="flex items-center gap-4 font-semibold">
          <RefreshCw
            onClick={fetchProducts}
            className="cursor-pointer hover:text-primary transition"
            size={22}
          />
          <IndianRupee className="text-green-600" size={22} />
          <span className="text-foreground">{totalStockValue.toLocaleString("en-IN")}</span>
        </div>
      </header>

      {/* Main */}
      <main className="p-5 md:p-8 max-w-7xl mx-auto">
        {products.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl shadow-md border border-border">
            <AlertCircle size={64} className="mx-auto text-muted-foreground mb-6" />
            <p className="text-xl font-medium text-foreground">
              No products in inventory
            </p>
            <p className="text-muted-foreground mt-2">
              Add new products from the dashboard
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => {
              const isEditing = editId === p._id;
              const lowStock = p.quantity < 5 && p.quantity > 0;
              const outOfStock = p.quantity === 0;

              return (
                <div
                  key={p._id}
                  className={`bg-card rounded-2xl shadow-lg overflow-hidden border transition-all duration-200 ${
                    outOfStock
                      ? "border-red-500/50 bg-red-500/5"
                      : lowStock
                      ? "border-yellow-500/50 bg-yellow-500/5"
                      : "border-border hover:border-teal-500/50 hover:shadow-xl"
                  }`}
                >
                  {/* Header */}
                  <div className="p-5 border-b bg-muted/30 flex justify-between items-center">
                    {isEditing ? (
                      <input
                        value={editedProduct.itemName}
                        onChange={(e) => handleChange("itemName", e.target.value)}
                        className="text-xl font-bold w-full px-4 py-3 bg-gray-900 border-2 border-teal-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.4)]"
                        placeholder="Product Name"
                      />
                    ) : (
                      <h3 className="text-xl font-bold text-white truncate max-w-[70%]">
                        {p.itemName}
                      </h3>
                    )}

                    <div className="flex items-center gap-2">
                      {lowStock && <AlertTriangle className="text-yellow-500" size={22} />}
                      {outOfStock && <AlertTriangle className="text-red-500" size={22} />}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-6">
                    {/* Sale Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Sale Price (₹)
                      </label>
                      <input
                        type="number"
                        disabled={!isEditing}
                        value={isEditing ? editedProduct.salePrice : p.salePrice}
                        onChange={(e) => handleChange("salePrice", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg bg-gray-900 text-white font-medium text-lg disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 ${
                          isEditing ? "border-teal-500 shadow-[0_0_10px_rgba(45,212,191,0.3)]" : "border-gray-700"
                        }`}
                      />
                    </div>

                    {/* Quantity - Super fixed visibility */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        disabled={!isEditing}
                        value={isEditing ? editedProduct.quantity : p.quantity}
                        onChange={(e) => handleChange("quantity", e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-lg bg-gray-950 text-white font-bold text-xl text-center disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),0_0_15px_rgba(45,212,191,0.4)] appearance-none [&::-webkit-inner-spin-button]:appearance-auto [&::-webkit-outer-spin-button]:appearance-auto ${
                          outOfStock
                            ? "border-red-500 text-red-400"
                            : lowStock
                            ? "border-yellow-500 text-yellow-400"
                            : "border-gray-700"
                        } ${isEditing ? "border-teal-500" : ""}`}
                      />
                      {outOfStock && (
                        <p className="text-red-500 text-sm mt-2 font-medium">
                          Out of stock
                        </p>
                      )}
                      {lowStock && !outOfStock && (
                        <p className="text-yellow-500 text-sm mt-2 font-medium">
                          Low stock – reorder soon
                        </p>
                      )}
                    </div>

                    {/* Purchase Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Purchase Price (₹)
                      </label>
                      <input
                        type="number"
                        disabled={!isEditing}
                        value={isEditing ? editedProduct.purchasePrice : p.purchasePrice}
                        onChange={(e) => handleChange("purchasePrice", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg bg-gray-900 text-white font-medium disabled:bg-gray-800 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 ${
                          isEditing ? "border-teal-500 shadow-[0_0_10px_rgba(45,212,191,0.3)]" : "border-gray-700"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-5 border-t bg-muted/20 flex justify-end gap-4">
                    {isEditing ? (
                      <>
                        <button
                          onClick={cancelEdit}
                          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEdit}
                          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition flex items-center gap-2 shadow-md"
                        >
                          <CheckCircle size={18} />
                          Save
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(p)}
                        className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition flex items-center gap-2 shadow-md"
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
