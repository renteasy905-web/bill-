import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

const EditSale = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sale, setSale] = useState({
    items: [],
    totalAmount: 0,
    paymentMode: "Cash",
  });
  const [products, setProducts] = useState([]); // All products
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch sale and all products
  useEffect(() => {
    const loadData = async () => {
      try {
        const [saleRes, productsRes] = await Promise.all([
          api.get(`/sales/${id}`),
          api.get("/allproducts"), // fetch all products
        ]);

        const saleData = saleRes.data.sale || saleRes.data;
        setSale(saleData);

        setProducts(productsRes.data.allproducts || productsRes.data); // all products
      } catch (err) {
        console.error("Failed to load sale or products", err);
        setError("Failed to load sale. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Update item quantity / price
  const handleItemChange = (index, field, value) => {
    const updatedItems = sale.items.map((item, i) =>
      i === index ? { ...item, [field]: Number(value) } : item
    );
    setSale({ ...sale, items: updatedItems });
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/sales/${id}`, sale);
      navigate("/allsales");
    } catch (err) {
      console.error("Update failed", err);
      setError("Failed to update sale. Try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60 text-gray-500">
        Loading sale...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">{error}</div>
    );
  }

  if (!sale.items || sale.items.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-10">
        No items found for this sale.
      </div>
    );
  }

  // Helper to get product name by ID
  const getProductName = (productId) => {
    const prod = products.find((p) => p._id === (productId._id || productId));
    return prod?.Name || prod?.name || "Unknown Product";
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Edit Sale</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
       {sale.items.map((item, index) => (
  <div
    key={item._id || index}
    className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 bg-gray-50 p-4 rounded-lg"
  >
    {/* Product Name */}
    <p className="font-medium text-gray-700 w-full sm:w-1/3">
      {getProductName(item.product)}
    </p>

    {/* Quantity Input */}
    <input
      type="number"
      min="1"
      value={item.quantity}
      onChange={(e) =>
        handleItemChange(index, "quantity", e.target.value)
      }
      placeholder="Quantity"
      className="border border-gray-300 rounded px-3 py-2 w-full sm:w-1/4"
      required
    />

    {/* Price Input */}
    <input
      type="number"
      min="0"
      value={item.price}
      onChange={(e) =>
        handleItemChange(index, "price", e.target.value)
      }
      placeholder="Rate"
      className="border border-gray-300 rounded px-3 py-2 w-full sm:w-1/4"
      required
    />
  </div>
))}


        {/* Payment Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <label className="font-medium text-gray-700 w-full sm:w-1/3">
            Payment Mode
          </label>
          <select
            value={sale.paymentMode}
            onChange={(e) =>
              setSale({ ...sale, paymentMode: e.target.value })
            }
            className="border border-gray-300 rounded px-3 py-2 w-full sm:w-1/4"
          >
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="text-right mt-4">
          <button
            type="submit"
            className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-black transition"
          >
            Update Sale
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSale;
