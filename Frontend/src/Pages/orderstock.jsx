// src/Pages/OrderStock.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { ArrowLeft, FileText, Trash2, Plus, AlertTriangle, Clock, RefreshCw } from "lucide-react";
// You need generateInvoicePDF from your utils (or similar function)
import { generateOrderPDF } from "../utils/generateOrderPDF"; // ← You need to create this

const OrderStock = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const today = new Date();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/allproducts");
      const all = res.data.products || res.data || [];
      setProducts(all);

      // Auto-create order list with problematic items
      const problematic = all.filter((p) => {
        const qty = Number(p.Quantity) || 0;
        const exp = p.Expiry ? new Date(p.Expiry) : null;
        const daysToExpiry = exp ? Math.ceil((exp - today) / (86400000)) : 9999;

        return (
          qty <= 20 || // low stock
          (daysToExpiry <= 90 && daysToExpiry >= 0) || // near expiry
          daysToExpiry < 0 // already expired
        );
      });

      setOrderItems(
        problematic.map((p) => ({
          ...p,
          orderQuantity: Math.max(50, Math.ceil((100 - p.Quantity) / 10) * 10), // suggest some quantity
        }))
      );

      setLoading(false);
    } catch (err) {
      setError("Failed to load inventory");
      setLoading(false);
    }
  };

  const updateOrderQty = (id, value) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, orderQuantity: Math.max(1, Number(value) || 1) } : item
      )
    );
  };

  const removeFromOrder = (id) => {
    setOrderItems((prev) => prev.filter((item) => item._id !== id));
  };

  const addToOrder = (product) => {
    if (orderItems.some((i) => i._id === product._id)) return;
    setOrderItems((prev) => [
      ...prev,
      { ...product, orderQuantity: 50 },
    ]);
  };

  const generateAndSendOrder = async () => {
    if (orderItems.length === 0) {
      alert("No items in order list!");
      return;
    }

    try {
      const pdfBlob = await generateOrderPDF(orderItems); // your PDF function

      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Try WhatsApp Web deep link (works best on mobile)
      const message = encodeURIComponent(
        `Urgent Stock Order for Vishwas Medical\n\nPlease find attached order list.`
      );
      const whatsappUrl = `https://wa.me/?text=${message}`;

      // 1. Download PDF
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `Stock_Order_${new Date().toISOString().slice(0,10)}.pdf`;
      link.click();

      // 2. Open WhatsApp after small delay
      setTimeout(() => {
        window.open(whatsappUrl, "_blank");
      }, 1500);

      alert("PDF downloaded! Opening WhatsApp... Attach the PDF manually if needed.");
    } catch (err) {
      console.error(err);
      alert("Error generating order PDF");
    }
  };

  if (loading) return <div className="p-10 text-center text-2xl">Loading inventory...</div>;
  if (error) return <div className="p-10 text-center text-red-500 text-xl">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="text-indigo-400 hover:text-indigo-300">
              <ArrowLeft size={32} />
            </button>
            <h1 className="text-4xl font-bold text-indigo-400">Stock Order Planning</h1>
          </div>
          <button
            onClick={fetchProducts}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
        </div>

        {/* Order List Controls */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <FileText size={28} className="text-indigo-400" />
              Order List ({orderItems.length} items)
            </h2>
            <button
              onClick={generateAndSendOrder}
              disabled={orderItems.length === 0}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                orderItems.length === 0
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/40"
              }`}
            >
              Generate Order & Send WhatsApp
            </button>
          </div>

          {orderItems.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No items added to order yet</p>
          ) : (
            <div className="space-y-4">
              {orderItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-slate-900 p-5 rounded-xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{item.Name}</h3>
                    <p className="text-sm text-slate-400">
                      Supplier: {item.stockBroughtBy || "—"}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <label className="text-sm text-slate-400 block mb-1">Order Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={item.orderQuantity}
                        onChange={(e) => updateOrderQty(item._id, e.target.value)}
                        className="w-24 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                      />
                    </div>

                    <button
                      onClick={() => removeFromOrder(item._id)}
                      className="text-red-400 hover:text-red-300 p-2"
                      title="Remove from order"
                    >
                      <Trash2 size={22} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Problematic Products Grid */}
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <AlertTriangle className="text-orange-500" />
          Products Needing Attention
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const qty = Number(p.Quantity) || 0;
            const exp = p.Expiry ? new Date(p.Expiry) : null;
            const daysLeft = exp ? Math.ceil((exp - today) / 86400000) : 9999;

            const isLow = qty <= 20;
            const isNear = daysLeft <= 90 && daysLeft >= 0;
            const isExpired = daysLeft < 0;

            if (!isLow && !isNear && !isExpired) return null;

            return (
              <div
                key={p._id}
                className={`p-6 rounded-2xl border-2 ${
                  isExpired
                    ? "border-red-600 bg-red-950/40"
                    : isNear
                    ? "border-orange-600 bg-orange-950/40"
                    : "border-yellow-600 bg-yellow-950/40"
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-xl">{p.Name}</h3>
                  {isExpired && <AlertTriangle className="text-red-500" />}
                  {isNear && !isExpired && <Clock className="text-orange-500" />}
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <p>Supplier: <strong>{p.stockBroughtBy || "—"}</strong></p>
                  <p>Current Stock: <strong className={qty <= 10 ? "text-red-400" : ""}>{qty}</strong></p>
                  {exp && (
                    <p>
                      Expires: <strong>{exp.toLocaleDateString("en-IN")}</strong> ({daysLeft} days)
                    </p>
                  )}
                </div>

                <button
                  onClick={() => addToOrder(p)}
                  disabled={orderItems.some((i) => i._id === p._id)}
                  className={`mt-5 w-full py-3 rounded-xl font-medium transition ${
                    orderItems.some((i) => i._id === p._id)
                      ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  Add to Order List
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderStock;
