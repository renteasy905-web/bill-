import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { AlertCircle, Package, ShoppingBag, CalendarDays, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ← Important! Import this way

const Notifications = () => {
  const [stockAlerts, setStockAlerts] = useState([]);
  const [purchaseReminders, setPurchaseReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const today = new Date(); // Current date ~ Jan 2026

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Get products from correct endpoint
        const productsRes = await api.get("/api/fetch");
        const allProducts = productsRes.data.products || []; // ← backend returns {success, products}

        const alerts = allProducts
          .map((product) => {
            const expiryDate = new Date(product.expiryDate);
            const daysToExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
            const isLowStock = product.quantity < 30;
            const isNearExpiry = daysToExpiry <= 90 && daysToExpiry >= 0;

            if (!isLowStock && !isNearExpiry) return null;

            return {
              ...product,
              type: "stock",
              reason: isLowStock ? "low_quantity" : "near_expiry",
              daysToExpiry: isNearExpiry ? daysToExpiry : null,
              stockLeft: product.quantity,
              Name: product.itemName, // map backend → frontend field
              Mrp: product.salePrice, // assuming salePrice is used as MRP
              Expiry: product.expiryDate,
              Quantity: product.quantity,
            };
          })
          .filter(Boolean);

        setStockAlerts(alerts);

        // 2. Customer refill reminders (~25–35 days ago)
        // ATTENTION: You need to implement /api/sales or /api/allsales on backend!
        // For now we simulate empty result — add real endpoint later
        const salesRes = await api.get("/api/sales"); // ← CHANGE THIS when you add endpoint
        const allSales = salesRes.data.sales || salesRes.data || [];

        const reminders = allSales
          .flatMap((sale) => {
            const saleDate = new Date(sale.date || sale.createdAt);
            const daysAgo = Math.floor((today - saleDate) / (1000 * 60 * 60 * 24));

            if (daysAgo < 25 || daysAgo > 35) return [];

            return (sale.items || []).map((item) => ({
              saleId: sale._id,
              date: sale.date || sale.createdAt,
              daysAgo,
              customer: sale.customer || { name: "Walk-in", phone: "—" },
              product: {
                Name: item.product?.itemName || item.productName || "Unknown Medicine",
                Mrp: item.product?.salePrice || 0,
              },
              quantity: item.quantity,
              price: item.price || item.salePrice || 0,
              type: "reminder",
              reason: "purchase_reminder",
            }));
          });

        setPurchaseReminders(reminders);
      } catch (err) {
        console.error("Notifications fetch error:", err);
        setError("Failed to load notifications. Check console & backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Generate PDF – Fixed import + usage
  const downloadReminderPDF = (reminder) => {
    const doc = new jsPDF({ format: "a4", orientation: "portrait" });

    const purple = "#6b21a8";
    const lightPurple = "#e9d5ff";
    const darkText = "#111827";

    // Header
    doc.setFillColor(purple);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("TAX INVOICE", 105, 18, { align: "center" });

    doc.setTextColor(lightPurple);
    doc.setFontSize(24);
    doc.text("MEDICAL INVOICE", 105, 38, { align: "center" });

    // Pharmacy details
    doc.setTextColor(darkText);
    doc.setFontSize(11);
    doc.text("Vishwas Medical", 20, 55);
    doc.text("Church Street, Bengaluru - 560001", 20, 62);
    doc.text("Phone: +91-XXXXXXXXXX", 20, 69);

    // Patient Details
    doc.setFillColor(lightPurple);
    doc.rect(10, 85, 190, 12, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Patient's Name", 15, 93);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${reminder.customer?.name || "Walk-in Patient"}`, 15, 103);
    doc.text(`Phone: ${reminder.customer?.phone || "—"}`, 15, 110);

    // Invoice Table (single item)
    autoTable(doc, {
      startY: 120,
      head: [["S.No", "Items", "HSN", "BATCH", "RATE", "MRP", "TAX", "Amount"]],
      body: [
        [
          1,
          reminder.product?.Name || "Medicine",
          "—",
          "—",
          reminder.price?.toFixed(2) || "0.00",
          `₹${reminder.product?.Mrp?.toFixed(2) || "0.00"}`,
          "—",
          `₹${(reminder.price * reminder.quantity).toFixed(2)}`,
        ],
      ],
      theme: "grid",
      headStyles: { fillColor: purple, textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 3 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // Total Amount
    doc.setFillColor(purple);
    doc.rect(130, finalY, 70, 10, "F");
    doc.setTextColor(255);
    doc.text("Total Amount", 135, finalY + 7);
    doc.setTextColor(darkText);
    doc.text(
      `₹${(reminder.price * reminder.quantity).toFixed(2)}`,
      175,
      finalY + 7,
      { align: "right" }
    );

    // Amount in words (simple placeholder – improve later if needed)
    doc.setFontSize(10);
    doc.text("Amount in words: Rupees One Hundred Only", 20, finalY + 25);

    // Terms & Conditions
    doc.text("Terms & Conditions:", 20, finalY + 45);
    doc.setFontSize(9);
    doc.text("1. Goods once sold will not be taken back or exchanged.", 25, finalY + 52);
    doc.text("2. All disputes subject to Bengaluru jurisdiction only.", 25, finalY + 59);
    doc.text("3. Medicines should be taken only on doctor's advice.", 25, finalY + 66);

    // Seal & Signature
    doc.setFontSize(11);
    doc.text("Seal & Signature", 150, finalY + 85, { align: "right" });

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
      <div className="pt-24 text-center text-slate-300 min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        Loading notifications... (Render may take 10-30s first time)
      </div>
    );
  }

  if (error) return (
    <div className="pt-24 text-center text-red-400 min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {error}
    </div>
  );

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
            <AlertCircle className="text-yellow-400" size={36} />
            Notifications
          </h1>
          <p className="text-slate-400 mt-3">
            Low stock • Near expiry • Customer refill reminders (≈1 month ago)
          </p>
        </div>

        {/* Stock & Expiry Alerts */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
            <Package size={28} className="text-emerald-400" />
            Stock & Expiry Alerts
          </h2>
          {stockAlerts.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No urgent stock or expiry issues right now.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {stockAlerts.map((item) => {
                const { text, color } = getTagStyleAndText(item);
                return (
                  <div
                    key={item._id}
                    className="relative bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-lg hover:border-slate-500 transition-all"
                  >
                    <div className={`absolute -top-3 right-4 px-4 py-1.5 rounded-full text-xs font-medium border ${color}`}>
                      {text}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-4 pr-28">{item.Name}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Quantity:</span>
                        <span className="text-white font-medium">{item.Quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">MRP:</span>
                        <span className="text-white font-medium">₹{item.Mrp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Expiry:</span>
                        <span className="text-white font-medium">
                          {new Date(item.Expiry).toDateString()}
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
              <br />
              (Backend needs /api/sales endpoint)
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {purchaseReminders.map((rem) => {
                const { text, color } = getTagStyleAndText(rem);
                return (
                  <div
                    key={rem.saleId + (rem.product?.Name || "prod")}
                    className="relative bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-lg hover:border-slate-500 transition-all"
                  >
                    <div className={`absolute -top-3 right-4 px-4 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${color}`}>
                      <CalendarDays size={14} />
                      {text}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-4 pr-40">
                      {rem.customer?.name || "Unknown Customer"}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone:</span>
                        <span className="text-white font-medium">{rem.customer?.phone || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Product:</span>
                        <span className="text-white font-medium">{rem.product?.Name}</span>
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
