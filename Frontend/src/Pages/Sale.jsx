import React, { useEffect, useState } from "react";

import api from "../utils/api";

const Sales = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch products and customers
  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/fetch");
      setProducts(res.data.t || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/getcustomers"); 
      // create /api/getCustomers endpoint to return all customers
      setCustomers(res.data.customers || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Add product to cart
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.product === product._id);
      if (exists) {
        return prev.map((p) =>
          p.product === product._id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      } else {
        return [...prev, { product: product._id, name: product.Name, price: product.Mrp, quantity: 1 }];
      }
    });
  };

  // Update quantity
  const updateQuantity = (id, qty) => {
    setCart((prev) =>
      prev.map((p) =>
        p.product === id ? { ...p, quantity: Math.max(1, qty) } : p
      )
    );
  };

  // Remove from cart
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p.product !== id));
  };

  // Calculate total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Submit sale
  const submitSale = async () => {
    if (!selectedCustomer || cart.length === 0) {
      alert("Select customer and add products");
      return;
    }
    try {
      setLoading(true);
      await api.post("/sale", {
        customer: selectedCustomer,
        items: cart.map((c) => ({ product: c.product, quantity: c.quantity, price: c.price })),
        paymentMode: "Cash",
      });
      alert("Sale created successfully");
      setCart([]);
      setSelectedCustomer("");
    } catch (err) {
      console.error(err);
      alert("Failed to create sale");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Customer Select */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-700 mb-1">Select Customer</label>
          <select
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            <option value="">-- Select Customer --</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Products</h2>
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => (
              <button
                key={p._id}
                onClick={() => addToCart(p)}
                className="bg-white shadow rounded-lg p-4 hover:bg-indigo-50 transition"
              >
                <div className="font-medium text-slate-800">{p.Name}</div>
                <div className="text-sm text-slate-500">₹{p.Mrp}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Cart</h2>
          {cart.length === 0 && <div className="text-slate-400">No products added</div>}
          {cart.map((item) => (
            <div key={item.product} className="flex items-center justify-between bg-white p-4 rounded-lg mb-2 shadow-sm">
              <div className="flex-1">
                <div className="font-medium text-slate-900">{item.name}</div>
                <div className="text-sm text-slate-500">₹{item.price}</div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.product, parseInt(e.target.value))}
                  className="w-16 text-center border rounded-lg px-2 py-1 outline-none"
                />
                <button
                  onClick={() => removeFromCart(item.product)}
                  className="text-red-500 font-bold px-2 py-1 rounded hover:bg-red-50 transition"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Total & Submit */}
        {cart.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <span className="font-bold text-lg text-slate-900">Total: ₹{total}</span>
            <button
              onClick={submitSale}
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Processing..." : "Submit Sale"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;
