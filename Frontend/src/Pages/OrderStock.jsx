// src/Pages/OrderStock.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { ArrowLeft, FileText, Trash2, RefreshCw } from "lucide-react";
import { generateOrderPDF } from "../utils/generatePDFs"; // Ensure this exists

const OrderStock = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [orderItems, setOrderItems] = useState([]); // Items added for ordering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/allproducts");
      const allProducts = res.data.products || res.data || [];

      // Extract unique suppliers
      const uniqueSuppliers = [
        ...new Set(allProducts.map((p) => p.stockBroughtBy || "Unknown")),
      ].filter(Boolean);

      setProducts(allProducts);
      setSuppliers(uniqueSuppliers);
      setLoading(false);
    } catch (err) {
      setError("Failed to load inventory. Please try again.");
      setLoading(false);
    }
  };

  // Filter products by selected supplier
  const filteredProducts =
    selectedSupplier && selectedSupplier !== "All"
      ? products.filter((p) => (p.stockBroughtBy || "Unknown") === selectedSupplier)
      : products;

  const addToOrder = (product) => {
    if (!orderItems.some((item) => item._id === product._id)) {
      setOrderItems((prev) => [
        ...prev,
        { ...product, orderQty: 50 }, // Default suggested quantity
      ]);
    }
  };

  const updateOrderQty = (id, value) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, orderQty: Math.max(1, Number(value) || 1) } : item
      )
    );
  };

  const removeFromOrder = (id) => {
    if (window.confirm("Remove this item from order?")) {
      setOrderItems((prev) => prev.filter((item) => item._id !== id));
    }
  };

  const generateOrderPDFAndShare = async () => {
    if (orderItems.length === 0) {
      alert("No items in the order list!");
      return;
    }

    try {
      const pdfBlob = await generateOrderPDF(orderItems, {
        name: "Vishwas Medical",
        address: "Shivamogga, Karnataka",
        phone: "Your Phone Number Here",
        supplier: selectedSupplier || "General Order",
      });

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Order_${selectedSupplier || "All"}_${new Date().toLocaleDateString("en-IN").replace(/\//g, "-")}.pdf`;
      link.click();

      // WhatsApp sharing prompt
      const message = encodeURIComponent(
        `Urgent Stock Order from Vishwas Medical\n\n` +
          `Supplier: ${selectedSupplier || "General"}\n` +
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
      console.error("PDF generation error:", err);
      alert("Error creating order PDF");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-2xl">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 text-xl">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="text-indigo-400 hover:text-indigo-300">
              <ArrowLeft size={32} />
            </button>
            <h1 className="text-4xl md:text-5xl font-bold text-indigo-400">Stock Ordering</h1>
          </div>
          <button
            onClick={fetchProducts}
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              loading ? "bg-slate-700 text-slate-500 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            <RefreshCw size={20} className={`${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Supplier Tabs */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <FileText size={28} className="text-indigo-400" />
            Select Supplier
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setSelectedSupplier(null);
                setOrderItems([]); // Optional: clear order when changing supplier
              }}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                !selectedSupplier
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              All Suppliers
            </button>
            {suppliers.map((sup) => (
              <button
                key={sup}
                onClick={() => {
                  setSelectedSupplier(sup);
                  setOrderItems([]); // Optional: clear order when changing supplier
                }}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  selectedSupplier === sup
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {sup}
              </button>
            ))}
          </div>
        </div>

        {/* Order Summary & Generate Button */}
        <div className="bg-slate-800/90 rounded-2xl p-6 mb-10 border border-slate-700 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <FileText size={28} className="text-indigo-400" />
              Order List ({orderItems.length} items)
            </h2>
            <button
              onClick={generateOrderPDFAndShare}
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
              Add products to order list
            </p>
          ) : (
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {orderItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-slate-900 p-5 rounded-xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
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
                        value={item.orderQty}
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

        {/* Supplier Products List */}
        <h2 className="text-3xl font-bold mb-6">
          {selectedSupplier ? `${selectedSupplier}'s Products` : "All Products"}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.length === 0 ? (
            <p className="text-slate-400 col-span-full text-center py-10 text-xl">
              No products found for this supplier.
            </p>
          ) : (
            filteredProducts.map((p) => (
              <div
                key={p._id}
                className="bg-slate-900 p-6 rounded-2xl border border-slate-700 hover:border-indigo-600 transition-all flex flex-col"
              >
                <h3 className="font-bold text-xl mb-3">{p.Name}</h3>
                <div className="space-y-2 text-sm mb-5 flex-1">
                  <p>
                    Current Stock: <strong>{Number(p.Quantity) || 0}</strong>
                  </p>
                  {p.Expiry && (
                    <p>
                      Expiry: <strong>{new Date(p.Expiry).toLocaleDateString("en-IN")}</strong>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => addToOrder(p)}
                  disabled={orderItems.some((o) => o._id === p._id)}
                  className={`w-full py-3 rounded-xl font-medium transition ${
                    orderItems.some((o) => o._id === p._id)
                      ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {orderItems.some((o) => o._id === p._id) ? "Added to Order" : "Add to Order"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderStock;
