import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { ArrowLeft, FileText, Trash2, AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { generateOrderPDF } from "../utils/generatePDFs"; // Make sure this file exists

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
      const allProducts = res.data.products || res.data || [];
      setProducts(allProducts);

      // Auto populate problematic items
      const needsAttention = allProducts.filter((p) => {
        const qty = Number(p.Quantity) || 0;
        const exp = p.Expiry ? new Date(p.Expiry) : null;
        const daysLeft = exp ? Math.ceil((exp - today) / (1000 * 60 * 60 * 24)) : 9999;

        return qty <= 20 || (daysLeft <= 90 && daysLeft >= -30) || daysLeft < 0;
      });

      setOrderItems(
        needsAttention.map((p) => ({
          ...p,
          suggestedQty: Math.max(50, Math.ceil((100 - p.Quantity) / 10) * 10),
        }))
      );

      setLoading(false);
    } catch (err) {
      setError("Failed to load inventory. Please try again.");
      setLoading(false);
    }
  };

  const updateOrderQty = (id, value) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, suggestedQty: Math.max(1, Number(value) || 1) } : item
      )
    );
  };

  const removeFromOrder = (id) => {
    if (window.confirm("Remove this item from order list?")) {
      setOrderItems((prev) => prev.filter((item) => item._id !== id));
    }
  };

  const generateOrderAndShare = async () => {
    if (orderItems.length === 0) {
      alert("No items in the order list!");
      return;
    }

    try {
      const pdfBlob = await generateOrderPDF(orderItems, {
        name: "Vishwas Medical",
        address: "Shivamogga, Karnataka",
        phone: "Your Phone Number Here",
      });

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Stock_Order_${new Date().toLocaleDateString("en-IN").replace(/\//g, "-")}.pdf`;
      link.click();

      const message = encodeURIComponent(
        `Urgent Stock Order Request from Vishwas Medical\n\n` +
        `Please find attached order list PDF.\n` +
        `Kindly supply the mentioned quantities at the earliest.\n` +
        `Thank you!`
      );

      const whatsappUrl = `https://wa.me/?text=${message}`;

      setTimeout(() => {
        window.open(whatsappUrl, "_blank");
        alert("PDF downloaded!\n\n1. Open WhatsApp\n2. Attach the downloaded PDF\n3. Send to supplier");
      }, 1200);
    } catch (err) {
      console.error("Order PDF error:", err);
      alert("Error creating order PDF");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-2xl">Loading inventory...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 text-xl">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back + Title + Refresh */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/")} 
              className="text-indigo-400 hover:text-indigo-300"
            >
              <ArrowLeft size={32} />
            </button>
            <h1 className="text-4xl md:text-5xl font-bold text-indigo-400">
              Stock Order Planning
            </h1>
          </div>

          {/* Refresh Button - restored */}
          <button
            onClick={fetchProducts}
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              loading 
                ? "bg-slate-700 text-slate-500 cursor-not-allowed" 
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            <RefreshCw size={20} className={`${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Order Summary & Generate Button */}
        <div className="bg-slate-800/90 rounded-2xl p-6 mb-10 border border-slate-700 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <FileText size={28} className="text-indigo-400" />
              Order List ({orderItems.length} items)
            </h2>
            <button
              onClick={generateOrderAndShare}
              disabled={orderItems.length === 0}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                orderItems.length === 0
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/40"
              }`}
            >
              Generate Order & Share via WhatsApp
            </button>
          </div>

          {orderItems.length === 0 ? (
            <p className="text-center text-slate-400 py-10 text-lg">
              No products need attention yet
            </p>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {orderItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-slate-900 p-5 rounded-xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-indigo-600 transition"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-1">{item.Name}</h3>
                    <p className="text-slate-400 text-sm">
                      Supplier: <span className="text-white">{item.stockBroughtBy || "Unknown"}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <label className="text-sm text-slate-400 block mb-1">Order Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={item.suggestedQty}
                        onChange={(e) => updateOrderQty(item._id, e.target.value)}
                        className="w-24 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-center"
                      />
                    </div>

                    <button
                      onClick={() => removeFromOrder(item._id)}
                      className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-950/50 transition"
                      title="Remove from order"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Problematic Products */}
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <AlertTriangle className="text-orange-500" size={32} />
          Products Needing Attention
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const qty = Number(p.Quantity) || 0;
            const exp = p.Expiry ? new Date(p.Expiry) : null;
            const daysLeft = exp ? Math.ceil((exp - today) / (1000 * 60 * 60 * 24)) : 9999;

            const isLow = qty <= 20;
            const isNearExpiry = daysLeft <= 90 && daysLeft >= -30;
            const isExpired = daysLeft < 0;

            if (!isLow && !isNearExpiry && !isExpired) return null;

            return (
              <div
                key={p._id}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  isExpired
                    ? "border-red-600 bg-red-950/30"
                    : isNearExpiry
                    ? "border-orange-600 bg-orange-950/30"
                    : "border-yellow-600 bg-yellow-950/30"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-xl">{p.Name}</h3>
                  {isExpired && <AlertTriangle className="text-red-500" size={28} />}
                  {isNearExpiry && !isExpired && <Clock className="text-orange-500" size={28} />}
                </div>

                <div className="space-y-2 text-sm mb-5">
                  <p>
                    Supplier: <strong className="text-white">{p.stockBroughtBy || "—"}</strong>
                  </p>
                  <p>
                    Current Stock: <strong className={qty <= 10 ? "text-red-400" : ""}>{qty}</strong>
                  </p>
                  {exp && (
                    <p>
                      Expiry: <strong>{exp.toLocaleDateString("en-IN")}</strong> ({daysLeft} days)
                    </p>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (!orderItems.some((o) => o._id === p._id)) {
                      setOrderItems((prev) => [
                        ...prev,
                        { ...p, suggestedQty: 50 },
                      ]);
                    }
                  }}
                  disabled={orderItems.some((o) => o._id === p._id)}
                  className={`w-full py-3 rounded-xl font-medium transition ${
                    orderItems.some((o) => o._id === p._id)
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
