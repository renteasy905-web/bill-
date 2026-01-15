import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  Receipt,
  Loader2,
  Trash2,
  Edit,
  Download,
  MessageCircle,
  X,
  Plus,
  Minus,
  Search,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ListofSales = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSale, setEditingSale] = useState(null);
  const [editedItems, setEditedItems] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Pharmacy details
  const pharmacy = {
    name: "Vishwas Medical",
    address: "Church Street, Bengaluru - 560001",
    phone: "+91-XXXXXXXXXX",
    gstin: "29ABCDE1234F1Z5",
  };

  // Fetch all sales
  const fetchAllSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/sales"); // ← assuming this is correct; if backend route is /allsales, change to "/allsales"
      console.log("Sales API Response:", res.data);

      const salesData = res.data.sales || res.data || [];
      setSales(salesData);
      setFilteredSales(salesData);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        err.response?.status === 404
          ? "Sales endpoint not found. Check backend /sales route."
          : "Failed to load sales records. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSales();
  }, []);

  // Search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSales(sales);
      return;
    }
    const term = searchTerm.toLowerCase().trim();
    const filtered = sales.filter((sale) => {
      const name = (sale.customer?.name || "Walk-in").toLowerCase();
      const phone = (sale.customer?.phone || "").toLowerCase();
      return name.includes(term) || phone.includes(term);
    });
    setFilteredSales(filtered);
  }, [searchTerm, sales]);

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

  // Delete sale
  const handleDelete = async (saleId) => {
    if (!window.confirm("Delete this sale? Stock will be restored.")) return;
    try {
      await api.delete(`/sales/${saleId}`); // ← correct DELETE endpoint
      const updated = sales.filter((s) => s._id !== saleId);
      setSales(updated);
      setFilteredSales(updated);
      showToast("Sale deleted successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete sale", "error");
    }
  };

  // Start editing
  const startEdit = (sale) => {
    setEditingSale(sale);
    setEditedItems(sale.items.map((item) => ({ ...item })));
  };

  const cancelEdit = () => {
    setEditingSale(null);
    setEditedItems([]);
  };

  // Save edited sale
  const saveEdit = async () => {
    if (!editingSale) return;
    try {
      const updatedTotal = editedItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
        0
      );
      await api.put(`/sales/${editingSale._id}`, { // ← correct PUT endpoint
        items: editedItems,
        totalAmount: updatedTotal,
        paymentMode: editingSale.paymentMode,
      });

      const updatedSales = sales.map((s) =>
        s._id === editingSale._id ? { ...s, items: editedItems, totalAmount: updatedTotal } : s
      );
      setSales(updatedSales);
      setFilteredSales(updatedSales);
      showToast("Sale updated successfully", "success");
      cancelEdit();
    } catch (err) {
      console.error(err);
      showToast("Failed to update sale", "error");
    }
  };

  // PDF Generation (unchanged – your code was already good)
  const generateInvoicePDF = (sale) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const purple = "#6b21a8";
    const lightPurple = "#e9d5ff";
    const darkText = "#111827";

    doc.setFillColor(purple);
    doc.rect(0, 0, 210, 30, "F");

    doc.setTextColor(255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("TAX INVOICE", 105, 18, { align: "center" });

    doc.setTextColor(lightPurple);
    doc.setFontSize(24);
    doc.text("MEDICAL INVOICE", 105, 38, { align: "center" });

    doc.setTextColor(darkText);
    doc.setFontSize(11);
    doc.text(pharmacy.name, 20, 55);
    doc.text(pharmacy.address, 20, 62);
    doc.text(`Phone: ${pharmacy.phone}`, 20, 69);
    if (pharmacy.gstin) doc.text(`GSTIN: ${pharmacy.gstin}`, 20, 76);

    doc.setFillColor(lightPurple);
    doc.rect(10, 85, 190, 12, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Details", 15, 93);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${sale.customer?.name || "Walk-in Patient"}`, 15, 103);
    doc.text(`Phone: ${sale.customer?.phone || "—"}`, 15, 110);

    const tableColumn = ["S.No", "Item", "Qty", "Rate", "Amount"];
    const tableRows = sale.items.map((item, index) => {
      const prodName =
        item.name ||
        item.product?.itemName ||
        item.product?.Name ||
        "Unknown Medicine";

      const amount = (item.price * item.quantity).toFixed(2);
      return [
        index + 1,
        prodName,
        item.quantity,
        `₹${item.price.toFixed(2)}`,
        `₹${amount}`,
      ];
    });

    doc.autoTable({
      startY: 125,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: purple, textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 3 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFillColor(purple);
    doc.rect(130, finalY, 70, 10, "F");
    doc.setTextColor(255);
    doc.text("Total Amount", 135, finalY + 7);
    doc.setTextColor(darkText);
    doc.text(`₹${sale.totalAmount?.toFixed(2) || "0.00"}`, 175, finalY + 7, { align: "right" });

    doc.setFontSize(10);
    doc.text("Amount in words: Rupees One Hundred Only", 20, finalY + 25);
    doc.text("Terms & Conditions:", 20, finalY + 45);
    doc.setFontSize(9);
    doc.text("1. Goods once sold will not be taken back or exchanged.", 25, finalY + 52);
    doc.text("2. All disputes subject to Bengaluru jurisdiction.", 25, finalY + 59);

    doc.setFontSize(11);
    doc.text("Seal & Signature", 150, finalY + 70, { align: "right" });

    return doc;
  };

  const handleDownload = (sale) => {
    const doc = generateInvoicePDF(sale);
    doc.save(`Invoice_${sale._id?.slice(-8) || "sale"}.pdf`);
  };

  const handleWhatsApp = (sale) => {
    if (!sale.customer?.phone) {
      showToast("Patient phone number not available", "error");
      return;
    }
    const phone = sale.customer.phone.replace(/\D/g, "");
    const message = `Dear ${sale.customer.name || "Patient"},\nYour invoice is ready!\nTotal: ₹${sale.totalAmount?.toFixed(2)}\nDate: ${new Date(sale.date).toLocaleDateString('en-IN')}\n\nThank you for choosing Vishwas Medical!`;
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
    handleDownload(sale);
    showToast("WhatsApp opened! Attach PDF manually if needed", "success");
  };

  if (loading) {
    return (
      <div className="pt-24 min-h-screen bg-gradient-to-br from-cream-50 to-cream-100 flex items-center justify-center">
        <Loader2 className="text-rose-500 animate-spin" size={48} />
        <span className="ml-4 text-xl text-rose-600">Loading sales records...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 min-h-screen bg-gradient-to-br from-cream-50 to-cream-100 text-red-600 text-center p-8 text-xl">
        {error}
      </div>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-cream-50 to-cream-100 pb-16">
      {/* Toast */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm text-white font-medium border-l-8 ${
              toast.type === "success"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400"
                : "bg-gradient-to-r from-rose-600 to-red-600 border-rose-400"
            }`}
          >
            {toast.type === "success" && <CheckCircle size={28} />}
            {toast.type === "error" && <AlertCircle size={28} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition shadow-md"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-4xl font-extrabold text-rose-800 flex items-center gap-4 flex-1 justify-center">
            <Receipt className="text-rose-600" size={40} />
            All Sales Records
          </h1>
          <button
            onClick={fetchAllSales}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition shadow-md disabled:opacity-50"
          >
            <RefreshCw size={18} className={`${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full mb-8">
          <input
            type="text"
            placeholder="Search by patient name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent text-gray-800 placeholder-gray-500 transition"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>

        {/* Sales List */}
        {filteredSales.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-12 text-center shadow-lg">
            <Receipt className="mx-auto text-gray-400 mb-6" size={80} />
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">
              {searchTerm ? "No matching sales found" : "No Sales Recorded Yet"}
            </h2>
            <p className="text-gray-500">
              {searchTerm ? "Try a different name or phone." : "Create your first sale from the New Sale page."}
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredSales.map((sale) => (
              <div
                key={sale._id}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:border-rose-300 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Sale #{sale._id.slice(-8)}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(sale.date).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <span className="bg-rose-100 text-rose-700 px-4 py-1.5 rounded-full font-semibold">
                    ₹{sale.totalAmount?.toLocaleString("en-IN") || "0"}
                  </span>
                </div>

                <div className="mb-5 pb-4 border-b border-gray-200">
                  <p className="text-gray-800 font-semibold">
                    Patient: {sale.customer?.name || "Walk-in"}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {sale.customer?.phone ? `+91 ${sale.customer.phone}` : "—"}
                  </p>
                </div>

                <div className="mb-5">
                  <p className="text-gray-700 font-semibold mb-2">Items</p>
                  <div className="space-y-2 text-sm text-gray-600">
                    {sale.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {item.name ||
                            item.product?.itemName ||
                            item.product?.Name ||
                            "Unnamed Medicine"}{" "}
                          × {item.quantity}
                        </span>
                        <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button
                    onClick={() => handleDownload(sale)}
                    className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    <Download size={18} />
                    PDF
                  </button>
                  <button
                    onClick={() => handleWhatsApp(sale)}
                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    <MessageCircle size={18} />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => startEdit(sale)}
                    className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition col-span-2"
                  >
                    <Edit size={18} />
                    Edit Sale
                  </button>
                  <button
                    onClick={() => handleDelete(sale._id)}
                    className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition col-span-2"
                  >
                    <Trash2 size={18} />
                    Delete Sale
                  </button>
                </div>

                <div className="mt-4 text-right text-sm text-gray-500">
                  Payment: {sale.paymentMode || "Cash"}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editingSale && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Edit Sale #{editingSale._id.slice(-8)}
                </h2>
                <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700">
                  <X size={28} />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                {editedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">
                        {item.name ||
                          item.product?.itemName ||
                          item.product?.Name ||
                          "Unknown Medicine"}
                      </p>
                      <p className="text-gray-600 text-sm">₹{item.price} each</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const newItems = [...editedItems];
                          if (newItems[idx].quantity > 1) newItems[idx].quantity--;
                          setEditedItems(newItems);
                        }}
                        className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-medium text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          const newItems = [...editedItems];
                          newItems[idx].quantity++;
                          setEditedItems(newItems);
                        }}
                        className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => setEditedItems(editedItems.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={cancelEdit}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ListofSales;