// src/pages/Cart.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  IndianRupee,
  RefreshCw,
  ArrowLeft,
  Pencil,
} from "lucide-react";
import api from "../utils/api";

const Cart = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);
  const [editedProduct, setEditedProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  /* ---------------- FETCH PRODUCTS ---------------- */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/allproducts");
      setProducts(res.data.products);
      setFilteredProducts(res.data.products);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ---------------- SEARCH ---------------- */
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const term = searchTerm.toLowerCase();
    setFilteredProducts(
      products.filter(
        (p) =>
          p.itemName.toLowerCase().includes(term) ||
          p.stockBroughtBy.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, products]);

  /* ---------------- TOAST ---------------- */
  useEffect(() => {
    if (!toast.show) return;
    const t = setTimeout(() => setToast({ show: false }), 3000);
    return () => clearTimeout(t);
  }, [toast.show]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  /* ---------------- EDIT HANDLERS ---------------- */
  const startEdit = (product) => {
    setEditId(product._id);
    setEditedProduct({ ...product });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditedProduct({});
  };

  const handleChange = (field, value) => {
    setEditedProduct((prev) => ({ ...prev, [field]: value }));
  };

  /* ---------------- SAVE EDIT ---------------- */
  const saveEdit = async () => {
    try {
      const payload = {
        itemName: editedProduct.itemName.trim(),
        salePrice: Number(editedProduct.salePrice),
        purchasePrice: Number(editedProduct.purchasePrice),
        quantity: Number(editedProduct.quantity),
        description: editedProduct.description || "",
        stockBroughtBy: editedProduct.stockBroughtBy || "",
        expiryDate: editedProduct.expiryDate || null,
      };

      const res = await api.put(`/products/${editId}`, payload);

      setProducts((prev) =>
        prev.map((p) => (p._id === editId ? res.data.product : p))
      );

      showToast("Product updated successfully");
      cancelEdit();
    } catch (err) {
      showToast("Failed to update product", "error");
    }
  };

  /* ---------------- TOTAL STOCK VALUE ---------------- */
  const totalStockValue = products.reduce(
    (sum, p) => sum + p.purchasePrice * p.quantity,
    0
  );

  /* ---------------- UI STATES ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-teal-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-5 py-3 rounded-xl text-white flex gap-2 ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.type === "success" ? <CheckCircle /> : <AlertCircle />}
            {toast.message}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")}>
              <ArrowLeft />
            </button>
            <h1 className="text-xl font-bold">Edit Products</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchProducts}
              className="flex items-center gap-2 px-4 py-2 bg-teal-100 rounded-lg"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <div className="flex items-center gap-1 font-bold">
              <IndianRupee />
              {totalStockValue.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" />
          <input
            className="w-full pl-10 pr-4 py-3 rounded-xl border"
            placeholder="Search products or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Products */}
      <main className="max-w-6xl mx-auto p-4 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const isEditing = editId === product._id;

          return (
            <div key={product._id} className="bg-white rounded-xl shadow">
              <div className="p-4 border-b font-bold">
                {isEditing ? (
                  <input
                    value={editedProduct.itemName}
                    onChange={(e) => handleChange("itemName", e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                ) : (
                  product.itemName
                )}
              </div>

              <div className="p-4 space-y-2">
                <input
                  type="number"
                  disabled={!isEditing}
                  value={isEditing ? editedProduct.salePrice : product.salePrice}
                  onChange={(e) => handleChange("salePrice", e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />

                <input
                  type="number"
                  disabled={!isEditing}
                  value={isEditing ? editedProduct.quantity : product.quantity}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
              </div>

              <div className="p-4 border-t flex justify-end gap-2">
                {isEditing ? (
                  <>
                    <button onClick={cancelEdit}>Cancel</button>
                    <button
                      onClick={saveEdit}
                      className="bg-teal-600 text-white px-4 py-1 rounded"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => startEdit(product)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-1 rounded"
                  >
                    <Pencil size={16} /> Edit
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default Cart;
