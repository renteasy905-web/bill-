// src/Pages/Sales.jsx
import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { Search, Plus, Minus, Trash2, Loader2, ShoppingCart, UserCheck } from "lucide-react";

const Sales = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");

  const [cart, setCart] = useState([]);
  const [isRegular, setIsRegular] = useState(false); // New: Regular sale (no customer)

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);

        // Products
        setLoadingProducts(true);
        const productsRes = await api.get("/api/fetch");
        const allProducts = productsRes.data.products || productsRes.data.data || [];
        setProducts(allProducts);
        setFilteredProducts(allProducts);

        // Customers (only load if not regular)
        if (!isRegular) {
          setLoadingCustomers(true);
          const customersRes = await api.get("/api/getcustomers");
          setCustomers(customersRes.data.customers || customersRes.data || []);
          setFilteredCustomers(customersRes.data.customers || customersRes.data || []);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoadingProducts(false);
        setLoadingCustomers(false);
      }
    };

    fetchData();
  }, [isRegular]); // Re-fetch customers when regular mode changes

  // Product search
  useEffect(() => {
    if (!productSearchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }
    const term = productSearchTerm.toLowerCase().trim();
    const filtered = products.filter((p) =>
      (p.itemName || "").toLowerCase().includes(term)
    );
    setFilteredProducts(filtered);
  }, [productSearchTerm, products]);

  // Customer search (only when not regular)
  useEffect(() => {
    if (isRegular || !customerSearchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }
    const term = customerSearchTerm.toLowerCase().trim().replace(/[\s-]/g, "");
    const filtered = customers.filter((c) => {
      const name = (c.name || "").toLowerCase();
      const phone = (c.phone || "").replace(/[\s-]/g, "").toLowerCase();
      return name.includes(term) || phone.includes(term);
    });
    setFilteredCustomers(filtered);
  }, [customerSearchTerm, customers, isRegular]);

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.product === product._id);
      if (exists) {
        return prev.map((p) =>
          p.product === product._id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, {
        product: product._id,
        name: product.itemName,
        price: product.salePrice,
        quantity: 1,
      }];
    });
  };

  const updateQuantity = (id, qty) => {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((p) => (p.product === id ? { ...p, quantity: qty } : p))
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p.product !== id));
  };

  const clearCart = () => {
    if (window.confirm("Clear cart?")) setCart([]);
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const submitSale = async () => {
    if (cart.length === 0) {
      alert("Add at least one product");
      return;
    }

    if (!isRegular && !selectedCustomer) {
      alert("Select a customer or choose Regular sale");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        items: cart.map((c) => ({
          product: c.product,
          quantity: c.quantity,
          price: c.price,
        })),
        paymentMode: "Cash",
      };

      // Only add customer if not regular
      if (!isRegular) {
        payload.customer = selectedCustomer._id;
      }

      await api.post("/api/sale", payload);

      alert("Sale created successfully!");
      setCart([]);
      setSelectedCustomer(null);
      setCustomerSearchTerm("");
      setIsRegular(false);
    } catch (err) {
      console.error("Sale error:", err);
      alert("Failed to create sale: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <ShoppingCart className="text-indigo-600" size={36} />
            Vishwas Medical Billing
          </h1>
          <p className="text-gray-600">Quick & Easy Sale Generation</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Products */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-800">Available Medicines</h2>
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search medicine..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            {loadingProducts ? (
              <div className="text-center py-10">
                <Loader2 className="animate-spin mx-auto text-indigo-500" size={40} />
                <p className="mt-2 text-gray-500">Loading medicines...</p>
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
                    <h3 className="font-semibold text-gray-800 mb-1">{p.itemName}</h3>
                    <p className="text-sm text-gray-600 mb-2">₹{p.salePrice}</p>
                    <p className="text-xs text-gray-500">Stock: {p.quantity}</p>
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

          {/* Right: Customer Search + Cart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 flex flex-col">
            {/* Customer Search / Regular Toggle */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Patient / Customer
                </label>
                <button
                  onClick={() => {
                    setIsRegular(!isRegular);
                    setSelectedCustomer(null);
                    setCustomerSearchTerm("");
                  }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                    isRegular
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {isRegular ? "Regular (No Details)" : "Require Patient"}
                </button>
              </div>

              {!isRegular && (
                <>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search name or phone..."
                      value={customerSearchTerm}
                      onChange={(e) => setCustomerSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  </div>

                  <div className="mt-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                    {loadingCustomers ? (
                      <div className="text-center py-4">
                        <Loader2 className="animate-spin mx-auto text-indigo-500" size={24} />
                      </div>
                    ) : filteredCustomers.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">
                        {customerSearchTerm ? "No matching customers" : "No customers yet"}
                      </p>
                    ) : (
                      filteredCustomers.map((c) => (
                        <div
                          key={c._id}
                          onClick={() => {
                            setSelectedCustomer(c);
                            setCustomerSearchTerm("");
                          }}
                          className={`p-3 border-b border-gray-200 hover:bg-indigo-50 cursor-pointer transition ${
                            selectedCustomer?._id === c._id ? "bg-indigo-100" : ""
                          }`}
                        >
                          <p className="font-medium text-gray-800">{c.name}</p>
                          <p className="text-sm text-gray-600">{c.phone ? `+91 ${c.phone}` : "No phone"}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {selectedCustomer && (
                    <div className="mt-3 p-3 bg-indigo-50 rounded-lg">
                      <p className="font-medium">Selected: {selectedCustomer.name}</p>
                      <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                    </div>
                  )}
                </>
              )}

              {isRegular && (
                <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg text-center text-green-700">
                  <UserCheck className="mx-auto mb-2" size={28} />
                  Regular / Walk-in Sale (No patient details required)
                </div>
              )}
            </div>

            {/* Cart Section */}
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
                  No items added yet
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
                disabled={submitting || (!isRegular && !selectedCustomer) || cart.length === 0}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all ${
                  submitting || (!isRegular && !selectedCustomer) || cart.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                }`}
              >
                {submitting ? (
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
