import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { Search, Plus, Minus, Trash2, Loader2 } from "lucide-react";

const Sales = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await api.get("/fetch");
      const allProducts = res.data.t || [];
      setProducts(allProducts);
      setFilteredProducts(allProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/getcustomers");
      setCustomers(res.data.customers || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  // Real-time product search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = products.filter((p) =>
      p.Name.toLowerCase().includes(term)
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Add to cart
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.product === product._id);
      if (exists) {
        return prev.map((p) =>
          p.product === product._id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }
      return [...prev, { product: product._id, name: product.Name, price: product.Mrp, quantity: 1 }];
    });
  };

  // Update quantity in cart
  const updateQuantity = (id, qty) => {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((p) =>
        p.product === id ? { ...p, quantity: qty } : p
      )
    );
  };

  // Remove from cart
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p.product !== id));
  };

  // Clear entire cart
  const clearCart = () => {
    if (window.confirm("Clear all items from cart?")) {
      setCart([]);
    }
  };

  // Calculate total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Submit sale
  const submitSale = async () => {
    if (!selectedCustomer || cart.length === 0) {
      alert("Please select a customer and add at least one product");
      return;
    }

    try {
      setLoading(true);
      await api.post("/sale", {
        customer: selectedCustomer,
        items: cart.map((c) => ({ product: c.product, quantity: c.quantity, price: c.price })),
        paymentMode: "Cash",
      });

      alert("Sale created successfully!");
      setCart([]);
      setSelectedCustomer("");
    } catch (err) {
      console.error("Sale error:", err);
      alert("Failed to create sale: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Vishwas Medical Billing</h1>
          <p className="text-gray-600">Quick & Easy Sale Billing</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Products & Search */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Available Medicines</h2>
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search medicine name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            {productsLoading ? (
              <div className="text-center py-10">
                <Loader2 className="animate-spin mx-auto text-indigo-500" size={40} />
                <p className="mt-2 text-gray-500">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No medicines found</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2">
                {filteredProducts.map((p) => (
                  <div
                    key={p._id}
                    className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer"
                    onClick={() => addToCart(p)}
                  >
                    <h3 className="font-semibold text-gray-800 mb-1">{p.Name}</h3>
                    <p className="text-sm text-gray-600 mb-2">₹{p.Mrp}</p>
                    <p className="text-xs text-gray-500">Stock: {p.Quantity}</p>
                    <div className="mt-2 flex justify-end">
                      <button className="bg-indigo-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-indigo-600 transition">
                        Add to Bill
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Cart & Customer */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 flex flex-col">
            {/* Customer Select */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer / Patient</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="">-- Select Customer --</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.phone ? `(${c.phone})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Cart */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Current Bill</h2>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <Trash2 size={16} /> Clear Cart
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  No items added yet. Start selecting medicines!
                </div>
              ) : (
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <div
                      key={item.product}
                      className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-600">₹{item.price} × {item.quantity}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product, item.quantity - 1)}
                            className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-10 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product, item.quantity + 1)}
                            className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total & Submit */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold text-gray-800">Grand Total:</span>
                <span className="text-2xl font-bold text-indigo-700">₹{total.toFixed(2)}</span>
              </div>

              <button
                onClick={submitSale}
                disabled={loading || !selectedCustomer || cart.length === 0}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all ${
                  loading || !selectedCustomer || cart.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Processing...
                  </span>
                ) : (
                  "Generate Bill & Submit Sale"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
