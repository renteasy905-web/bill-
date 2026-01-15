import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { 
  ArrowLeft, 
  FileText, 
  Trash2, 
  RefreshCw, 
  Plus,
  Loader2,
  AlertCircle
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

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
  const [newItemQty, setNewItemQty] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
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

  const filteredProducts = selectedSupplier
    ? products.filter((p) => (p.stockBroughtBy || "Unknown") === selectedSupplier)
    : [];

  const changeSupplier = (supplier) => {
    if (supplier !== selectedSupplier) {
      if (orderItems.length > 0 && !window.confirm("Changing supplier will clear current order list. Continue?")) {
        return;
      }
      setSelectedSupplier(supplier);
      setOrderItems([]);
      setNewItemName("");
      setNewItemQty("");
    }
  };

  const addToOrder = (product) => {
    if (!orderItems.some((item) => item._id === product._id)) {
      setOrderItems((prev) => [
        ...prev,
        { ...product, orderQty: "" },
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
      _id: `manual_${Date.now()}`,
      itemName: newItemName.trim(),
      stockBroughtBy: selectedSupplier,
      orderQty: newItemQty.trim() === "" ? "" : Number(newItemQty),
      isManual: true,
    };

    setOrderItems((prev) => [...prev, manualItem]);
    setNewItemName("");
    setNewItemQty("");
  };

  const updateOrderQty = (id, value) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, orderQty: value } : item
      )
    );
  };

  const removeFromOrder = (id) => {
    if (window.confirm("Remove this item from order?")) {
      setOrderItems((prev) => prev.filter((item) => item._id !== id));
    }
  };

  // PDF Generation & Share
  const generateOrderAndShare = () => {
    if (orderItems.length === 0) {
      alert("No items in the order list!");
      return;
    }
    if (!selectedSupplier) {
      alert("Please select a supplier!");
      return;
    }

    // Filter only items with quantity > 0
    const validItems = orderItems.filter(item => item.orderQty && item.orderQty > 0);

    if (validItems.length === 0) {
      alert("Please enter quantity for at least one item");
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const purple = "#6b21a8";
    const lightPurple = "#e9d5ff";

    // Header
    doc.setFillColor(purple);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("STOCK ORDER", 105, 25, { align: "center" });

    doc.setTextColor("#ffffff");
    doc.setFontSize(16);
    doc.text("Vishwas Medical", 105, 35, { align: "center" });

    // Shop Details
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.text("Vishwas Medical", 20, 55);
    doc.text("Church Street, Bengaluru - 560001", 20, 62);
    doc.text("Phone: +91-XXXXXXXXXX", 20, 69);

    // Supplier
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`To: ${selectedSupplier}`, 20, 85);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 20, 92);

    // Table
    const tableData = validItems.map((item, index) => [
      index + 1,
      item.itemName,
      item.orderQty
    ]);

    doc.autoTable({
      startY: 105,
      head: [["S.No", "Item Name", "Order Qty"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: purple, textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 11, cellPadding: 5 },
      columnStyles: {
        0: { halign: "center" },
        2: { halign: "center" }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 20;

    // Footer Notes
    doc.setFontSize(11);
    doc.text("Please supply the above items at the earliest.", 20, finalY);
    doc.text("Thank you!", 20, finalY + 8);

    doc.setFontSize(10);
    doc.text("This is a computer-generated order.", 20, finalY + 25);

    // Save PDF
    const fileName = `Order_${selectedSupplier.replace(/\s+/g, "_")}_${new Date().toLocaleDateString("en-IN").replace(/\//g, "-")}.pdf`;
    doc.save(fileName);

    // Open WhatsApp
    const message = encodeURIComponent(
      `Urgent Stock Order from Vishwas Medical\n\n` +
      `To: ${selectedSupplier}\n` +
      `Date: ${new Date().toLocaleDateString("en-IN")}\n\n` +
      `Please find the attached order PDF with ${validItems.length} items.\n` +
      `Kindly confirm and supply at the earliest.\n\n` +
      `Thank you!`
    );

    window.open(`https://wa.me/?text=${message}`, "_blank");

    alert(`PDF "${fileName}" downloaded!\nOpen WhatsApp and attach the PDF to send to supplier.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-2xl">
        <Loader2 className="animate-spin mr-3" size={32} />
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-red-400 text-xl p-6 text-center">
        <AlertCircle size={64} className="mb-6" />
        {error}
        <button
          onClick={fetchProducts}
          className="mt-6 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-bold shadow-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="text-indigo-400 hover:text-indigo-300 transition"
            >
              <ArrowLeft size={32} />
            </button>
            <h1 className="text-4xl md:text-5xl font-bold text-indigo-400">
              Stock Ordering
            </h1>
          </div>
          <button
            onClick={fetchProducts}
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              loading
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-lg"
            }`}
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Supplier Selection */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-white">
            <FileText size={28} className="text-indigo-400" />
            Select Supplier (Required)
          </h2>
          <div className="flex flex-wrap gap-3">
            {suppliers.map((sup) => (
              <button
                key={sup}
                onClick={() => changeSupplier(sup)}
                className={`px-6 py-3 rounded-xl font-medium transition-all shadow-sm ${
                  selectedSupplier === sup
                    ? "bg-indigo-600 text-white border-2 border-indigo-400"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600"
                }`}
              >
                {sup}
              </button>
            ))}
          </div>
        </div>

        {selectedSupplier ? (
          <>
            {/* Manual Add Item */}
            <div className="bg-slate-800/90 rounded-2xl p-6 mb-10 border border-slate-700 shadow-xl">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                <Plus size={24} className="text-green-400" />
                Add New Item Manually
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Item name (e.g. Paracetamol 500mg)"
                  className="flex-1 px-5 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex items-end gap-3">
                  <div>
                    <label className="text-sm text-slate-300 block mb-1">Qty</label>
                    <input
                      type="number"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(e.target.value)}
                      placeholder="Qty"
                      className="w-24 px-4 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    onClick={addManualItem}
                    className="px-6 py-4 bg-green-600 hover:bg-green-700 rounded-xl font-medium text-white transition shadow-md"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Order List */}
            <div className="bg-slate-800/90 rounded-2xl p-6 mb-10 border border-slate-700 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-6">
                <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-white">
                  <FileText size={28} className="text-indigo-400" />
                  Order for {selectedSupplier} ({orderItems.length} items)
                </h2>
                <button
                  onClick={generateOrderAndShare}
                  className="px-8 py-4 rounded-xl font-bold text-lg bg-green-600 hover:bg-green-700 text-white transition-all shadow-lg"
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
                      className="bg-slate-900 p-5 rounded-xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-white"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-1">
                          {item.itemName}{" "}
                          {item.isManual && (
                            <span className="text-xs text-slate-500">(Manual)</span>
                          )}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          Supplier: {item.stockBroughtBy}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div>
                          <label className="text-sm text-slate-400 block mb-1">
                            Order Qty
                          </label>
                          <input
                            type="number"
                            value={item.orderQty}
                            onChange={(e) => updateOrderQty(item._id, e.target.value)}
                            placeholder="Qty"
                            className="w-24 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <button
                          onClick={() => removeFromOrder(item._id)}
                          className="text-red-400 hover:text-red-300 p-3 rounded-lg hover:bg-red-950/50 transition"
                        >
                          <Trash2 size={24} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Existing Products */}
            <h2 className="text-3xl font-bold mb-6 text-white">
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
                    className="bg-slate-900 p-6 rounded-2xl border border-slate-700 hover:border-indigo-600 transition-all flex flex-col shadow-lg"
                  >
                    <h3 className="font-bold text-xl mb-4 text-white">
                      {p.itemName || "Unnamed Product"}
                    </h3>
                    {p.expiryDate && (
                      <p className="text-sm text-slate-400 mb-4">
                        Expiry: {new Date(p.expiryDate).toLocaleDateString("en-IN")}
                      </p>
                    )}
                    <p className="text-sm text-slate-300 mb-4">
                      Current Stock: {p.quantity}
                    </p>
                    <button
                      onClick={() => addToOrder(p)}
                      disabled={orderItems.some((o) => o._id === p._id)}
                      className={`w-full py-3 rounded-xl font-medium transition shadow-md ${
                        orderItems.some((o) => o._id === p._id)
                          ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
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
          <div className="text-center py-20 text-xl text-slate-400 bg-slate-800/50 rounded-2xl">
            Please select a supplier to start ordering
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStock;