import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Loader2,
  ShoppingCart,
  UserCheck,
  Printer,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

const Sales = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("customer");
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [isRegular, setIsRegular] = useState(false);
  const [loading, setLoading] = useState({ products: true, customers: true });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Auto-hide toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Fetch data
  const loadData = async () => {
    try {
      setError(null);
      setLoading({ products: true, customers: true });

      const [prodRes, custRes] = await Promise.all([
        api.get("/products"),
        api.get("/customers"),
      ]);

      const prods = prodRes.data.products || [];
      setProducts(prods);
      setFilteredProducts(prods);

      const custs = custRes.data.customers || [];
      setCustomers(custs);
      setFilteredCustomers(custs);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        err.response?.status === 404
          ? "Data endpoints not found (404). Check backend routes."
          : "Failed to load data. Please check connection."
      );
    } finally {
      setLoading({ products: false, customers: false });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Search filters
  useEffect(() => {
    if (productSearch.trim()) {
      const term = productSearch.toLowerCase();
      setFilteredProducts(
        products.filter((p) =>
          (p.itemName || p.Name || "").toLowerCase().includes(term)
        )
      );
    } else {
      setFilteredProducts(products);
    }

    if (!isRegular && customerSearch.trim()) {
      const term = customerSearch.toLowerCase().replace(/[\s-]/g, "");
      setFilteredCustomers(
        customers.filter((c) => {
          const name = c.name?.toLowerCase() || "";
          const phone = c.phone?.replace(/[\s-]/g, "").toLowerCase() || "";
          return name.includes(term) || phone.includes(term);
        })
      );
    } else {
      setFilteredCustomers(customers);
    }
  }, [productSearch, customerSearch, isRegular, products, customers]);

  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.product === product._id);
      if (exists) {
        return prev.map((i) =>
          i.product === product._id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, {
        product: product._id,
        name: product.itemName || product.Name,
        price: product.salePrice || product.Mrp || 0,
        quantity: qty,
        supplier: product.stockBroughtBy || "Unknown",
      }];
    });

    setToast({
      show: true,
      message: `Added ${product.itemName || product.Name} × ${qty} to bill`,
      type: "success",
    });
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return;
    setCart((prev) => prev.map((i) => (i.product === id ? { ...i, quantity: qty } : i)));
  };

  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.product !== id));

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const submitSale = async () => {
    if (cart.length === 0) return alert("Add at least one item");
    if (!isRegular && !selectedCustomer) return alert("Select a customer");

    try {
      setSubmitting(true);
      const payload = {
        items: cart.map((i) => ({
          product: i.product,
          quantity: i.quantity,
          price: i.price,
        })),
        totalAmount: total,
        paymentMode: "Cash",
        ...( !isRegular && { customer: selectedCustomer._id }),
      };

      await api.post("/sales", payload);

      setToast({
        show: true,
        message: "Sale recorded successfully!",
        type: "success",
      });

      // Clear cart and reset form
      setCart([]);
      setSelectedCustomer(null);
      setCustomerSearch("");
      setIsRegular(false);
      setTab("customer");

      // Immediately navigate to All Sales page
      navigate("/allsales");
    } catch (err) {
      alert("Failed to save: " + (err.response?.data?.message || "Error"));
    } finally {
      setSubmitting(false);
    }
  };

  const previewBill = () => {
    alert(
      "Bill Preview:\n" +
        cart.map((i) => `${i.name} × ${i.quantity} = ₹${i.price * i.quantity}`).join("\n") +
        `\n\nTotal: ₹${total.toFixed(2)}`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-cream-100 pb-32 relative">
      {/* Toast */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-xs text-white font-medium ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}>
            {toast.type === "success" ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Floating Cart Summary (Mobile) */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl p-4 lg:hidden">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items: {cart.length}</p>
              <p className="text-xl font-bold text-teal-700">₹{total.toFixed(2)}</p>
            </div>
            <button
              onClick={() => setTab("cart")}
              className="bg-teal-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg hover:bg-teal-700 transition"
            >
              <ShoppingCart size={20} /> View Cart
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition shadow-md"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="text-center flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
              <ShoppingCart className="text-teal-600" size={36} />
              Billing Desk
            </h1>
            <p className="text-gray-600">Professional • Fast • Accurate</p>
          </div>
          <button
            onClick={loadData}
            disabled={loading.products || loading.customers}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition shadow-md disabled:opacity-50"
          >
            <RefreshCw size={18} className={`${loading.products || loading.customers ? "animate-spin" : ""}`} />
            {loading.products || loading.customers ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center shadow-sm">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex justify-center gap-4 mb-8 bg-white rounded-full p-2 shadow-sm border border-gray-200">
          {["customer", "products", "cart"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                tab === t ? "bg-teal-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t === "customer" ? "Patient" : t === "products" ? "Medicines" : "Cart"}
            </button>
          ))}
        </div>

        {/* Patient Section */}
        {tab === "customer" && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Select Patient</h2>
              <button
                onClick={() => {
                  setIsRegular(!isRegular);
                  setSelectedCustomer(null);
                  setCustomerSearch("");
                }}
                className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                  isRegular ? "bg-green-100 text-green-700 border border-green-300" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {isRegular ? "Regular Sale" : "Search Patient"}
              </button>
            </div>

            {isRegular ? (
              <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
                <UserCheck className="mx-auto mb-3 text-green-600" size={40} />
                <h3 className="text-lg font-semibold text-green-800">Regular / Walk-in Sale</h3>
                <p className="text-green-700 mt-1">No patient details required</p>
              </div>
            ) : (
              <>
                <div className="relative mb-6">
                  <input
                    type="text"
                    placeholder="Search name or phone..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-400 rounded-2xl text-gray-900 placeholder:text-gray-500 text-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                </div>

                {loading.customers ? (
                  <div className="text-center py-10">
                    <Loader2 className="animate-spin mx-auto text-teal-600" size={48} />
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <p className="text-center text-gray-500 py-10">
                    {customerSearch ? "No matching patients" : "Start typing to search"}
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                    {filteredCustomers.map((c) => (
                      <div
                        key={c._id}
                        onClick={() => {
                          setSelectedCustomer(c);
                          setTab("products");
                        }}
                        className={`p-5 bg-white border rounded-2xl shadow-sm hover:shadow-md hover:border-teal-300 transition cursor-pointer flex justify-between items-center ${
                          selectedCustomer?._id === c._id ? "border-teal-500 bg-teal-50" : ""
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{c.name}</p>
                          <p className="text-sm text-gray-600">{c.phone ? `+91 ${c.phone}` : "No phone"}</p>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {selectedCustomer && (
              <div className="mt-6 p-5 bg-teal-50 border border-teal-200 rounded-2xl">
                <p className="font-bold text-teal-800">Selected Patient</p>
                <p className="text-lg font-medium">{selectedCustomer.name}</p>
                <p className="text-gray-700">{selectedCustomer.phone}</p>
              </div>
            )}
          </div>
        )}

        {/* Products Section */}
        {tab === "products" && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Select Medicines</h2>
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search medicine..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-400 rounded-2xl text-gray-900 placeholder:text-gray-500 text-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            {loading.products ? (
              <div className="text-center py-12">
                <Loader2 className="animate-spin mx-auto text-teal-600" size={48} />
              </div>
            ) : filteredProducts.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No medicines found</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((p) => (
                  <div
                    key={p._id}
                    className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-teal-300 transition-all cursor-pointer"
                    onClick={() => addToCart(p)}
                  >
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{p.itemName || p.Name || "Unnamed"}</h3>
                    <p className="text-teal-700 font-semibold">₹{p.salePrice || p.Mrp || 0}</p>
                    <p className="text-sm text-gray-600">Stock: {p.quantity || p.Quantity || 0}</p>
                    <p className="text-sm text-gray-500">Supplier: {p.stockBroughtBy || "Unknown"}</p>
                    <button className="mt-4 w-full bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition">
                      Add to Bill
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cart Section */}
        {tab === "cart" && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Current Bill</h2>
              {cart.length > 0 && (
                <button
                  onClick={() => window.confirm("Clear entire bill?") && setCart([])}
                  className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm font-medium"
                >
                  <Trash2 size={18} />
                  Clear
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl">
                <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 text-lg">Your bill is empty</p>
                <p className="text-gray-400 mt-1">Add medicines from the Products tab</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.product}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">₹{item.price} × {item.quantity}</p>
                      <p className="text-sm text-gray-500">Supplier: {item.supplier}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-white border border-gray-300 rounded-lg">
                        <button
                          onClick={() => updateQty(item.product, item.quantity - 1)}
                          className="px-3 py-2 hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} className="text-gray-900" />
                        </button>
                        <span className="px-4 font-medium text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.product, item.quantity + 1)}
                          className="px-3 py-2 hover:bg-gray-100"
                        >
                          <Plus size={16} className="text-gray-900" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total & Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold text-gray-900">Grand Total</span>
                <span className="text-3xl font-bold text-teal-700">₹{total.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={previewBill}
                  className="py-4 bg-gray-100 text-gray-800 rounded-xl font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
                >
                  <Printer size={20} />
                  Preview
                </button>
                <button
                  onClick={submitSale}
                  disabled={submitting || cart.length === 0 || (!isRegular && !selectedCustomer)}
                  className={`py-4 rounded-xl text-white font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                    submitting || cart.length === 0 || (!isRegular && !selectedCustomer)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-teal-600 hover:bg-teal-700 shadow-lg"
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Processing...
                    </>
                  ) : (
                    "Generate Bill"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;