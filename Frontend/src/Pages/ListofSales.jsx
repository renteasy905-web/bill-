// src/Pages/Sales.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // For redirect after success
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
  CheckCircle,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

const Sales = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("customer"); // customer | products | cart
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

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Fetch data
  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        const [prodRes, custRes] = await Promise.all([
          api.get("/api/fetch"),
          api.get("/api/getcustomers"),
        ]);

        const prods = prodRes.data.products || [];
        setProducts(prods);
        setFilteredProducts(prods);

        const custs = custRes.data.customers || [];
        setCustomers(custs);
        setFilteredCustomers(custs);
      } catch (err) {
        console.error(err);
        setError("Failed to load data. Check connection.");
      } finally {
        setLoading({ products: false, customers: false });
      }
    };
    loadData();
  }, []);

  // Real-time search
  useEffect(() => {
    if (productSearch.trim()) {
      const term = productSearch.toLowerCase();
      setFilteredProducts(products.filter((p) => p.itemName?.toLowerCase().includes(term)));
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

  // Show colorful toast
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  // Add to cart + Toast
  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.product === product._id);
      if (exists) {
        return prev.map((i) =>
          i.product === product._id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [
        ...prev,
        {
          product: product._id,
          name: product.itemName,
          price: product.salePrice,
          quantity: qty,
        },
      ];
    });

    showToast(`Added ${product.itemName} × ${qty} to bill`, "success");
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return;
    setCart((prev) => prev.map((i) => (i.product === id ? { ...i, quantity: qty } : i)));
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((i) => i.product !== id));
    showToast("Item removed from bill", "warning");
  };

  const clearCart = () => {
    if (window.confirm("Clear entire bill?")) {
      setCart([]);
      showToast("Bill cleared", "info");
    }
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const submitSale = async () => {
    if (cart.length === 0) return alert("Add at least one item");
    if (!isRegular && !selectedCustomer) return alert("Select a customer");

    try {
      setSubmitting(true);
      const payload = {
        items: cart.map((i) => ({ product: i.product, quantity: i.quantity, price: i.price })),
        totalAmount: total,
        paymentMode: "Cash",
        ...( !isRegular && { customer: selectedCustomer._id } ),
      };

      await api.post("/api/sale", payload);

      showToast("Bill generated successfully!", "success");

      // Redirect to all sales after success
      setTimeout(() => {
        setCart([]);
        setSelectedCustomer(null);
        setCustomerSearch("");
        setIsRegular(false);
        setTab("customer");
        navigate("/allsales");
      }, 1500); // Give time to see toast
    } catch (err) {
      showToast("Failed to save bill: " + (err.response?.data?.message || "Error"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getCartQty = (productId) => {
    const item = cart.find((i) => i.product === productId);
    return item ? item.quantity : 0;
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
      {/* Colorful Toast */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm text-white font-medium border-l-8 ${
              toast.type === "success"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400"
                : toast.type === "error"
                ? "bg-gradient-to-r from-rose-600 to-red-600 border-rose-400"
                : toast.type === "warning"
                ? "bg-gradient-to-r from-amber-600 to-orange-600 border-amber-400"
                : "bg-gradient-to-r from-indigo-600 to-blue-600 border-indigo-400"
            }`}
          >
            {toast.type === "success" && <CheckCircle size={28} />}
            {toast.type === "error" && <AlertCircle size={28} />}
            {toast.type === "warning" && <AlertCircle size={28} />}
            {toast.type === "info" && <Info size={28} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Floating Cart Bar (Mobile) */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl p-4 lg:hidden">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Items: {cart.length} • Total</p>
              <p className="text-xl font-bold text-teal-700">₹{total.toFixed(2)}</p>
            </div>
            <button
              onClick={() => setTab("cart")}
              className="bg-teal-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg hover:bg-teal-700 transition"
            >
              <ShoppingCart size={20} /> Cart
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <ShoppingCart className="text-teal-600" size={36} />
            Billing Desk
          </h1>
          <p className="text-gray-600">Professional • Fast • Accurate</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center shadow-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
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

        {/* Paste your existing tab content here (customer, products, cart) */}
        {/* For brevity, assuming you have the sections from previous messages */}
        {/* ... Your customer, products, cart tab content goes here ... */}

        {/* Example Product Card Snippet (with quantity visible) */}
        {/* In your products tab: */}
        {filteredProducts.map((p) => {
          const qtyInCart = getCartQty(p._id);
          return (
            <div key={p._id} className="bg-white rounded-2xl p-5 shadow-sm border">
              <h3>{p.itemName}</h3>
              <p>₹{p.salePrice}</p>
              {qtyInCart > 0 ? (
                <div className="flex items-center gap-4 mt-3">
                  <button onClick={() => updateQty(p._id, qtyInCart - 1)} className="p-2 bg-gray-200 rounded">
                    <Minus size={16} />
                  </button>
                  <span className="font-bold">{qtyInCart}</span>
                  <button onClick={() => updateQty(p._id, qtyInCart + 1)} className="p-2 bg-gray-200 rounded">
                    <Plus size={16} />
                  </button>
                </div>
              ) : (
                <button onClick={() => addToCart(p)} className="mt-3 bg-teal-600 text-white px-4 py-2 rounded">
                  Add to Bill
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sales;
