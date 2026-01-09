import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { Receipt, Loader2 } from "lucide-react";

const ListofSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllSales = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/allsales");
        // Assuming backend returns { success: true, count: n, sales: [...] }
        setSales(res.data.sales || res.data || []); // handle both formats
      } catch (err) {
        console.error("Error fetching all sales:", err);
        setError("Failed to load sales records. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllSales();
  }, []);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="text-indigo-400 animate-spin" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-red-400 text-center p-8">
        {error}
      </div>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <Receipt className="text-rose-400" size={36} />
          All Sales Records
        </h1>

        {sales.length === 0 ? (
          <div className="text-center text-slate-400 text-xl py-12">
            No sales recorded yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sales.map((sale) => (
              <div
                key={sale._id}
                className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-lg hover:border-rose-500 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Sale #{sale._id.slice(-6)}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {new Date(sale.date).toLocaleString()}
                    </p>
                  </div>
                  <span className="bg-rose-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    ₹{sale.totalAmount}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-slate-300 font-medium">
                    Customer: {sale.customer?.name || "Unknown"}
                  </p>
                  <p className="text-slate-400 text-sm">
                    Phone: {sale.customer?.phone || "—"}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-slate-300 font-medium">Items:</p>
                  {sale.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-white">
                        {item.product?.Name || "Product"} × {item.quantity}
                      </span>
                      <span className="text-slate-300">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700 text-right">
                  <p className="text-slate-400 text-sm">
                    Payment: {sale.paymentMode}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default ListofSales;
