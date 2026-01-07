import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api"; // Axios instance with baseURL: http://localhost:3000/api

const ListofSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSales = async () => {
      try {
        const res = await api.get("/allsales");
        console.log("API RESPONSE:", res.data); // debug

        if (res.data && Array.isArray(res.data.sale)) {
          setSales(res.data.sale);
        } else {
          setSales([]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch sales. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60 text-gray-500">
        Loading sales...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-20">{error}</div>
    );
  }

  if (!sales.length) {
    return (
      <div className="text-center text-gray-500 mt-20">
        No sales found
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Sales Overview
        </h1>
        <p className="text-sm text-gray-500">
          View and manage all recorded sales
        </p>
      </div>

      {/* Sales Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sales.map((sale) => (
          <div
            key={sale._id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition"
          >
            {/* Top */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-900 truncate">
                {sale.customer?.name || "Walk-in Customer"}
              </h3>
              <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium">
                {sale.paymentMode}
              </span>
            </div>

            {/* Body */}
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900">
                ₹{sale.totalAmount}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(sale.createdAt).toLocaleString()}
              </p>

              {/* Products List */}
              <div className="mt-2">
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                  Products:
                </h4>
                {sale.items && sale.items.length > 0 ? (
                  <ul className="text-sm text-gray-700 space-y-1">
                    {sale.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>{item.product?.name || "Unknown Product"}</span>
                        <span>
                          Qty: {item.quantity} | ₹{item.price}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No products</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 text-right">
              <Link to={`/editsales/${sale._id}`}>
                <button className="inline-flex items-center gap-1 text-sm font-medium text-white bg-gray-900 hover:bg-black px-4 py-2 rounded-lg transition">
                  Edit Sale
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListofSales;
