// src/Pages/OrderStock.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { ArrowLeft, FileText, Trash2, RefreshCw, Plus } from "lucide-react";
import { generateOrderPDF } from "../utils/generatePDFs";

const OrderStock = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For manual item addition
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState(50);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/allproducts");
      const allProducts = res.data.products || res.data || [];

      const uniqueSuppliers = [
        ...new Set(allProducts.map((p) => p.stockBroughtBy || "Unknown")),
      ].filter(Boolean);

      setProducts(allProducts);
      setSuppliers(uniqueSuppliers);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products. Please try again later.");
      setLoading(false);
    }
  };

  // Filter products for selected supplier only
  const filteredProducts = selectedSupplier
    ? products.filter((p) => (p.stockBroughtBy || "Unknown") === selectedSupplier)
    : [];

  const changeSupplier = (supplier) => {
    if (supplier !== selectedSupplier) {
      if (
        orderItems.length > 0 &&
        !window.confirm(
          "Changing supplier will clear current order list. Continue?"
        )
      ) {
        return;
      }
      setSelectedSupplier(supplier);
      setOrderItems([]); // Clear order when changing supplier
      setNewItemName("");
      setNewItemQty(50);
    }
  };

  const addToOrder = (product) => {
    if (!orderItems.some((item) => item._id === product._id)) {
      setOrderItems((prev) => [
        ...prev,
        { ...product, orderQty: 50 },
      ]);
    }
  };

  const addManualItem = () => {
    if (!newItemName.trim()) {
      alert("Please enter item name");
      return;
    }
    if (!selectedSupplier) {
      alert("Please select a supplier first");
      return;
    }

    const manualItem = {
      _id: `manual_${Date.now()}`, // temporary unique id
      Name: newItemName.trim(),
      stockBroughtBy: selectedSupplier,
      orderQty: Math.max(1, Number(newItemQty) || 50),
      isManual: true,
    };

    setOrderItems((prev) => [...prev, manualItem]);
    setNewItemName("");
    setNewItemQty(50);
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

  const generateOrderAndShare = async () => {
    if (orderItems.length === 0) {
      alert("No items in the order list!");
      return;
    }
    if (!selectedSupplier) {
      alert("Please select a supplier before generating order!");
      return;
    }

    try {
      const pdfBlob = await generateOrderPDF(orderItems, {
        name: "Vishwas Medical",
        address: "Shivamogga, Karnataka",
        phone: "Your Phone Number Here",
        supplier: selectedSupplier,
      });

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Order_${selectedSupplier}_${new Date()
        .toLocaleDateString("en-IN")
        .replace(/\//g, "-")}.pdf`;
      link.click();

      const message = encodeURIComponent(
        `Urgent Stock Order Request from Vishwas Medical\n\n` +
          `To: ${selectedSupplier}\n` +
          `Please find attached order list PDF.\n` +
          `Kindly supply the mentioned quantities at the earliest.\n` +
          `Thank you!`
      );

      const whatsappUrl = `https://wa.me/?text=${message}`;

      setTimeout(() => {
        window.open(whatsappUrl, "_blank");
        alert(
          "PDF downloaded!\n\n1. Open WhatsApp\n2. Attach the downloaded PDF\n3. Send to supplier"
        );
      }, 1200);
    } catch (err) {
      console.error("Order PDF error:", err);
      alert("Error creating or sharing order PDF");
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
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium ${
              loading ? "bg-slate-700 text-slate-500" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Supplier Selection - Required */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <FileText size={28} className="text-indigo-400" />
            Select Supplier (Required for Ordering)
          </h2>

          <div className="flex flex-wrap gap-3">
            {suppliers.map((sup) => (
              <button
                key={sup}
                onClick={() => changeSupplier(sup)}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  selectedSupplier === sup
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {sup}
              </button>
            ))}
          </div>
        </div>

        {/* Only show content when supplier is selected */}
        {selectedSupplier ? (
          <>
            {/* Manual Add Item */}
            <div className="bg-slate-800/90 rounded-2xl p-6 mb-10 border border-slate-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus size={24} /> Add New Item Manually
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Item name (e.g. Paracetamol 500mg)"
                  className="flex-1 px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white"
                />
                <div className="flex items-end gap-3">
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(e.target.value)}
                      className="w-24 px-3 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white text-center"
                    />
                  </div>
                  <button
                    onClick={addManualItem}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Order List */}
            <div className="bg-slate-800/90 rounded-2xl p-6 mb-10 border border-slate-700 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-6">
                <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                  <FileText size={28} className="text-indigo-400" />
                  Order for {selectedSupplier} ({orderItems.length} items)
                </h2>

                <button
                  onClick={generateOrderAndShare}
                  disabled={orderItems.length === 0}
                  className={`px-8 py-4 rounded-xl font-bold text-lg ${
                    orderItems.length === 0
                      ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/40"
                  }`}
                >
                  Generate PDF & Share
                </button>
              </div>

              {orderItems.length === 0 ? (
                <p className="text-center text-slate-400 py-12 text-lg">
                  Add items from the list below or manually
                </p>
              ) : (
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                  {orderItems.map((item) => (
                    <div
                      key={item._id}
                      className="bg-slate-900 p-5 rounded-xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-1">
                          {item.Name} {item.isManual && <span className="text-xs text-slate-500">(Manual)</span>}
                        </h3>
                        <p className="text-slate-400 text-sm">Supplier: {item.stockBroughtBy}</p>
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
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-950/50"
                        >
                          <Trash2 size={24} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Existing Products from this Supplier */}
            <h2 className="text-3xl font-bold mb-6">
              Available Products from {selectedSupplier}
            </h2>

            {filteredProducts.length === 0 ? (
              <p className="text-slate-400 text-center py-12 text-xl">
                No existing products found for this supplier.
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((p) => (
                  <div
                    key={p._id}
                    className="bg-slate-900 p-6 rounded-2xl border border-slate-700 hover:border-indigo-600 transition-all flex flex-col"
                  >
                    <h3 className="font-bold text-xl mb-4">{p.Name}</h3>
                    {p.Expiry && (
                      <p className="text-sm text-slate-400 mb-6">
                        Expiry: {new Date(p.Expiry).toLocaleDateString("en-IN")}
                      </p>
                    )}
                    <button
                      onClick={() => addToOrder(p)}
                      disabled={orderItems.some((o) => o._id === p._id)}
                      className={`w-full py-3 rounded-xl font-medium transition ${
                        orderItems.some((o) => o._id === p._id)
                          ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      }`}
                    >
                      {orderItems.some((o) => o._id === p._id) ? "Added" : "Add to Order"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-xl text-slate-400">
            Please select a supplier to start ordering
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStock;
