import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { AlertCircle, Package, ShoppingBag, CalendarDays } from "lucide-react";

const Notifications = () => {
  const [stockAlerts, setStockAlerts] = useState([]);
  const [purchaseReminders, setPurchaseReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const today = new Date(); // January 09, 2026

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Get all products → filter low stock & near expiry on frontend
        const productsRes = await api.get("allproducts");
        const allProducts = productsRes.data.allproducts || [];

        // Calculate alerts
        const alerts = allProducts
          .map((product) => {
            const expiryDate = new Date(product.Expiry);
            const daysToExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));

            const isLowStock = product.Quantity < 30;
            const isNearExpiry = daysToExpiry <= 90 && daysToExpiry >= 0;

            if (!isLowStock && !isNearExpiry) return null;

            return {
              ...product,
              type: "stock",
              reason: isLowStock ? "low_quantity" : "near_expiry",
              daysToExpiry: isNearExpiry ? daysToExpiry : null,
              stockLeft: product.Quantity,
            };
          })
          .filter(Boolean);

        setStockAlerts(alerts);

        // 2. Get all sales → filter purchases ~25 to 35 days ago
        const salesRes = await api.get("/allsales");
        const allSales = salesRes.data.sales || []; // Adjusted for your updated response structure

        const oneMonthAgoStart = new Date(today);
        oneMonthAgoStart.setDate(today.getDate() - 35);

        const oneMonthAgoEnd = new Date(today);
        oneMonthAgoEnd.setDate(today.getDate() - 25);

        const reminders = allSales
          .flatMap((sale) => {
            const saleDate = new Date(sale.date);
            const daysAgo = Math.floor((today - saleDate) / (1000 * 60 * 60 * 24));

            if (daysAgo < 25 || daysAgo > 35) return [];

            return sale.items.map((item) => ({
              saleId: sale._id,
              date: sale.date,
              daysAgo,
              customer: sale.customer,
              product: item.product,
              quantity: item.quantity,
              type: "reminder",
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

    fetchNotifications();
  }, []);

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
        Loading notifications...
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 text-center text-red-400 min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        {error}
      </div>
    );
  }

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

        {/* Customer Purchase Reminders */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
            <ShoppingBag size={28} className="text-amber-400" />
            Customer Refill Reminders (~1 month ago)
          </h2>
          {purchaseReminders.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No customer refill reminders for this period.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {purchaseReminders.map((rem) => {
                const { text, color } = getTagStyleAndText(rem);
                return (
                  <div
                    key={rem.saleId + rem.product._id}
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
