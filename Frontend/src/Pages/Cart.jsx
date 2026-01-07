import React, { useState, useEffect } from "react";
import api from "../utils/api";

const Cart = () => {
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
      const res = await api.get("/fetch");
      setProducts(res.data.t || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 EXPIRY COLOR LOGIC
  const getExpiryBg = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);

    const diffMonths =
      (expiry - today) / (1000 * 60 * 60 * 24 * 30);

    if (diffMonths <= 3) return "bg-red-100 border-red-300";
    if (diffMonths <= 6) return "bg-sky-100 border-sky-300";
    return "bg-green-100 border-green-300";
  };

  const startEdit = (product) => {
    setEditId(product._id);
    setEditedProduct({ ...product });
  };

  const saveEdit = async () => {
    try {
      await api.put(
        `/fetch/${editId}`,
        editedProduct
      );

      setProducts((prev) =>
        prev.map((p) =>
          p._id === editId ? { ...editedProduct } : p
        )
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

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b">
        <div className="max-w-xl mx-auto flex items-center justify-between px-6 py-5">
          <span className="text-xl font-extrabold">
            Inventory
          </span>
          <button
            onClick={fetchProducts}
            className={`h-11 w-11 rounded-2xl flex items-center justify-center ${
              loading
                ? "animate-spin bg-indigo-100 text-indigo-600"
                : "bg-slate-100 hover:bg-indigo-100"
            }`}
          >
            🔄
          </button>
        </div>
      </header>

      {/* PRODUCTS */}
      <main className="max-w-xl mx-auto px-5 pt-6 space-y-5">
        {products.map((item) => (
          <div
            key={item._id}
            className={`rounded-[2.25rem] border transition-all duration-300 ${
              editId === item._id
                ? "bg-white border-indigo-300 shadow-xl"
                : `${getExpiryBg(item.Expiry)} shadow-sm`
            }`}
          >
            <div className="p-6">
              {editId === item._id ? (
                /* EDIT MODE */
                <div className="space-y-3">
                  <input
                    value={editedProduct.Name || ""}
                    onChange={(e) =>
                      handleChange("Name", e.target.value)
                    }
                    placeholder="Product Name"
                    className="w-full rounded-2xl bg-slate-100 px-5 py-3 outline-none"
                  />

                  <input
                    value={editedProduct.Description || ""}
                    onChange={(e) =>
                      handleChange("Description", e.target.value)
                    }
                    placeholder="Description"
                    className="w-full rounded-2xl bg-slate-100 px-5 py-3 outline-none"
                  />

                  <input
                    type="number"
                    value={editedProduct.Mrp || ""}
                    onChange={(e) =>
                      handleChange("Mrp", Number(e.target.value))
                    }
                    placeholder="MRP"
                    className="w-full rounded-2xl bg-slate-100 px-5 py-3 outline-none"
                  />

                  <input
                    type="number"
                    value={editedProduct.Quantity || ""}
                    onChange={(e) =>
                      handleChange("Quantity", Number(e.target.value))
                    }
                    placeholder="Quantity"
                    className="w-full rounded-2xl bg-slate-100 px-5 py-3 outline-none"
                  />

                  <input
                    type="date"
                    value={editedProduct.Expiry || ""}
                    onChange={(e) =>
                      handleChange("Expiry", e.target.value)
                    }
                    className="w-full rounded-2xl bg-slate-100 px-5 py-3 outline-none"
                  />

                  <button
                    onClick={saveEdit}
                    className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-semibold"
                  >
                    Save
                  </button>
                </div>
              ) : (
                /* VIEW MODE */
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <div className="text-lg font-bold">
                      {item.Name}
                    </div>
                    <div className="text-sm text-slate-600">
                      {item.Description}
                    </div>
                    <div className="font-medium">
                      ₹{item.Mrp}
                    </div>
                    <div className="text-sm">
                      Qty: {item.Quantity}
                    </div>
                    <div className="text-sm">
                      Expiry:{" "}
                      {new Date(item.Expiry).toDateString()}
                    </div>
                  </div>

                  <button
                    onClick={() => startEdit(item)}
                    className="h-11 w-11 rounded-2xl hover:bg-indigo-100"
                  >
                    ✏️
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default Cart;
