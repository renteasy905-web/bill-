import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  AlertCircle,
  Package,
  ShoppingBag,
  CalendarDays,
  Download,
  ArrowLeft,
  RefreshCw,
  Loader2,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Notifications = () => {
  const navigate = useNavigate();
  const [stockAlerts, setStockAlerts] = useState([]);
  const [purchaseReminders, setPurchaseReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const today = new Date();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all products
      const productsRes = await api.get("/products");
      const allProducts = productsRes.data.products || productsRes.data || [];

      // Process stock & expiry alerts
      const alerts = allProducts
        .map((product) => {
          const expiryDate = new Date(product.expiryDate || product.Expiry || null);
          const daysToExpiry = expiryDate
            ? Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24))
            : null;
          const quantity = Number(product.quantity || 0);
          const isLowStock = quantity < 30;
          const isNearExpiry = daysToExpiry !== null && daysToExpiry <= 90 && daysToExpiry >= 0;

          if (!isLowStock && !isNearExpiry) return null;

          return {
            _id: product._id,
            itemName: product.itemName || "Unnamed Product",
            quantity,
            salePrice: Number(product.salePrice || 0),
            expiryDate: product.expiryDate || product.Expiry,
            daysToExpiry: isNearExpiry ? daysToExpiry : null,
            stockLeft: quantity,
            reason: isLowStock ? "low_quantity" : "near_expiry",
          };
        })
        .filter(Boolean);

      setStockAlerts(alerts);

      // Fetch sales for refill reminders (optional - won't crash if fails)
      let allSales = [];
      try {
        const salesRes = await api.get("/sales"); // FIXED: use /sales (assuming backend route is /sales)
        allSales = salesRes.data.sales || salesRes.data || [];
        console.log("Sales fetched successfully:", allSales.length);
      } catch (salesErr) {
        console.warn("Could not fetch sales (optional):", salesErr.message);
        // Continue without sales - reminders will be empty
      }

      const reminders = allSales
        .flatMap((sale) => {
          const saleDate = new Date(sale.date || sale.createdAt || new Date());
          const daysAgo = Math.floor((today - saleDate) / (1000 * 60 * 60 * 24));
          if (daysAgo < 25 || daysAgo > 35) return [];

          return (sale.items || []).map((item) => ({
            saleId: sale._id || "unknown",
            date: sale.date || sale.createdAt || new Date().toISOString(),
            daysAgo,
            customer: sale.customer || { name: "Walk-in Patient", phone: "—" },
            product: {
              itemName: item.name || item.product?.itemName || "Unknown Medicine",
              salePrice: Number(item.price || item.salePrice || 0),
            },
            quantity: Number(item.quantity || 1),
            price: Number(item.price || 0),
            reason: "purchase_reminder",
          }));
        });

      setPurchaseReminders(reminders);
    } catch (err) {
      console.error("Notifications fetch error:", err);
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const downloadReminderPDF = (reminder) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const purple = "#6b21a8";
    const lightPurple = "#e9d5ff";
    const darkText = "#111827";

    doc.setFillColor(purple);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Vishwas Medical", 105, 18, { align: "center" });

    doc.setTextColor(lightPurple);
    doc.setFontSize(24);
    doc.text("MEDICAL INVOICE", 105, 38, { align: "center" });

    doc.setTextColor(darkText);
    doc.setFontSize(11);
    doc.text("Vishwas Medical", 20, 55);
    doc.text("Beside bus stand sindagi", 20, 62);
    doc.text("Phone: +91-63610 27924", 20, 69);

    doc.setFillColor(lightPurple);
    doc.rect(10, 85, 190, 12, "F");

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Patient's Name", 15, 93);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${reminder.customer?.name || "Walk-in Patient"}`, 15, 103);
    doc.text(`Phone: ${reminder.customer?.phone || "—"}`, 15, 110);

    autoTable(doc, {
      startY: 120,
      head: [["S.No", "Items", "HSN", "BATCH", "RATE", "MRP", "TAX", "Amount"]],
      body: [
        [
          1,
          reminder.product?.itemName || "Medicine",
          "—",
          "—",
          reminder.price?.toFixed(2) || "0.00",
          `₹${reminder.product?.salePrice?.toFixed(2) || "0.00"}`,
          "—",
          `₹${(reminder.price * reminder.quantity).toFixed(2)}`,
        ],
      ],
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
    doc.text(`₹${(reminder.price * reminder.quantity).toFixed(2)}`, 175, finalY + 7, { align: "right" });

    doc.text("Terms & Conditions:", 20, finalY + 45);
    doc.setFontSize(9);
    doc.text("Return will be taken within 72hrs", 25, finalY + 52);
    doc.text("2. All disputes subject to jurisdiction only.", 25, finalY + 59);
    doc.text("3. Medicines should be taken only on doctor's advice.", 25, finalY + 66);

    doc.setFontSize(11);
    doc.text("This is a computer-generated invoice with digital signature.", 150, finalY + 85, { align: "right" });

    doc.save(`Reminder_Invoice_${reminder.saleId?.slice(-8) || "unknown"}.pdf`);
  };

  const getTagStyleAndText = (item) => {
    if (item.reason === "low_quantity") {
      return {
        text: `Low stock: only ${item.stockLeft} left`,
        color: "bg-red-900/70 text-red-300 border-red-700",
      };
    }
    if (item.reason === "near_expiry") {
      return {
        text: `Near expiry: ${item.daysToExpiry} days left`,
        color: "bg-orange-900/70 text-orange-300 border-orange-700",
      };
    }
    if (item.reason === "purchase_reminder") {
      return {
        text: `Purchased ${item.daysAgo} days ago`,
        color: "bg-blue-900/70 text-blue-300 border-blue-700",
      };
    }
    return { text: "Alert", color: "bg-gray-700 text-gray-300" };
  };

  if (loading) {
    return (
      <div className="pt-24 min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="text-indigo-400 animate-spin" size={48} />
        <span className="ml-4 text-xl text-slate-300">Loading notifications...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-red-400 text-center p-8 text-xl">
        {error}
      </div>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition shadow-md"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <h1 className="text-4xl font-semibold text-white flex items-center gap-3 flex-1 justify-center">
            <AlertCircle className="text-yellow-400" size={36} />
            Notifications
          </h1>

          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition shadow-md disabled:opacity-50"
          >
            <RefreshCw size={18} className={`${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <p className="text-center text-slate-400 mb-12">
          Low stock • Near expiry • Customer refill reminders (~25-35 days ago)
        </p>

        {/* Stock & Expiry Alerts */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
            <Package size={28} className="text-emerald-400" />
            Stock & Expiry Alerts
          </h2>

          {stockAlerts.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              No urgent stock or expiry issues right now.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {stockAlerts.map((item) => {
                const { text, color } = getTagStyleAndText(item);
                return (
                  <div
                    key={item._id}
                    className="relative bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-lg hover:border-slate-500 transition-all"
                  >
                    <div
                      className={`absolute -top-3 right-4 px-4 py-1.5 rounded-full text-xs font-medium border ${color}`}
                    >
                      {text}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-4 pr-28">
                      {item.itemName}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Quantity:</span>
                        <span className="text-white font-medium">{item.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Sale Price:</span>
                        <span className="text-white font-medium">₹{item.salePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Expiry:</span>
                        <span className="text-white font-medium">
                          {item.expiryDate ? new Date(item.expiryDate).toDateString() : "No Expiry"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Customer Refill Reminders */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
            <ShoppingBag size={28} className="text-amber-400" />
            Customer Refill Reminders (~1 month ago)
          </h2>

          {purchaseReminders.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              No customer refill reminders for this period.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {purchaseReminders.map((rem) => {
                const { text, color } = getTagStyleAndText(rem);
                return (
                  <div
                    key={rem.saleId + (rem.product?.itemName || "prod")}
                    className="relative bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-lg hover:border-slate-500 transition-all"
                  >
                    <div
                      className={`absolute -top-3 right-4 px-4 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${color}`}
                    >
                      <CalendarDays size={14} />
                      {text}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-4 pr-40">
                      {rem.customer?.name || "Unknown Customer"}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone:</span>
                        <span className="text-white font-medium">
                          {rem.customer?.phone || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Product:</span>
                        <span className="text-white font-medium">{rem.product?.itemName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Qty:</span>
                        <span className="text-white font-medium">{rem.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Sold:</span>
                        <span className="text-white font-medium">
                          {new Date(rem.date).toDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadReminderPDF(rem)}
                      className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition"
                    >
                      <Download size={18} />
                      Download Invoice PDF
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Notifications;