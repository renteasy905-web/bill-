import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // For redirection
import api from "../utils/api";
import { Search, Plus, Minus, Trash2, Loader2, ShoppingCart, UserCheck, Printer, CheckCircle, ChevronRight } from "lucide-react";

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
      const timer = setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Fetch data (unchanged)
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
        setError("Failed to load data. Check connection.");
      } finally {
        setLoading({ products: false, customers: false });
      }
    };
    loadData();
  }, []);

  // Search filters (unchanged)
  useEffect(() => {
    if (productSearch.trim()) {
      const term = productSearch.toLowerCase();
      setFilteredProducts(products.filter(p => p.itemName?.toLowerCase().includes(term)));
    } else {
      setFilteredProducts(products);
    }

    if (!isRegular && customerSearch.trim()) {
      const term = customerSearch.toLowerCase().replace(/[\s-]/g, "");
      setFilteredCustomers(
        customers.filter(c => {
          const name = c.name?.toLowerCase() || "";
          const phone = c.phone?.replace(/[\s-]/g, "").toLowerCase() || "";
          return name.includes(term) || phone.includes(term);
        })
      );
    } else {
      setFilteredCustomers(customers);
    }
  }, [productSearch, customerSearch, isRegular, products, customers]);

  // Add to cart + Toast (unchanged)
  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const exists = prev.find(i => i.product === product._id);
      if (exists) {
        return prev.map(i =>
          i.product === product._id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, {
        product: product._id,
        name: product.itemName,
        price: product.salePrice,
        quantity: qty,
      }];
    });

    setToast({
      show: true,
      message: `Added ${product.itemName} × ${qty} to bill`,
      type: "success"
    });
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return;
    setCart(prev => prev.map(i => i.product === id ? { ...i, quantity: qty } : i));
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(i => i.product !== id));
    setToast({ show: true, message: "Item removed from bill", type: "warning" });
  };

  const clearCart = () => {
    if (window.confirm("Clear entire bill?")) {
      setCart([]);
      setToast({ show: true, message: "Bill cleared", type: "info" });
    }
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const submitSale = async () => {
    if (cart.length === 0) return alert("Add at least one item");
    if (!isRegular && !selectedCustomer) return alert("Select a customer");

    try {
      setSubmitting(true);
      const payload = {
        items: cart.map(i => ({ product: i.product, quantity: i.quantity, price: i.price })),
        totalAmount: total,
        paymentMode: "Cash",
        ...( !isRegular && { customer: selectedCustomer._id } ),
      };

      await api.post("/api/sale", payload);

      // Success toast
      setToast({
        show: true,
        message: "Bill generated successfully! Redirecting to Sales Report...",
        type: "success"
      });

      // Reset form and redirect to /allsales after short delay
      setTimeout(() => {
        setCart([]);
        setSelectedCustomer(null);
        setCustomerSearch("");
        setIsRegular(false);
        setTab("customer");
        navigate("/allsales"); // ← Redirects to all sales page
      }, 1800); // 1.8 seconds delay so user sees toast
    } catch (err) {
      setToast({
        show: true,
        message: "Failed to save bill: " + (err.response?.data?.message || "Error"),
        type: "error"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getCartQty = (productId) => {
    const item = cart.find(i => i.product === productId);
    return item ? item.quantity : 0;
  };

  const previewBill = () => {
    alert(
      "Bill Preview:\n" +
      cart.map(i => `${i.name} × ${i.quantity} = ₹${i.price * i.quantity}`).join("\n") +
      `\n\nTotal: ₹${total.toFixed(2)}`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-cream-100 pb-32 relative">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 animate-slide-in ${toast.type === "success" ? "bg-gradient-to-r from-green-600 to-emerald-600" : toast.type === "error" ? "bg-gradient-to-r from-red-600 to-rose-600" : "bg-gradient-to-r from-blue-600 to-indigo-600"} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm`}>
          {toast.type === "success" && <CheckCircle size={24} />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Floating Cart Summary */}
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

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center shadow-sm">{error}</div>}

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8 bg-white rounded-full p-2 shadow-sm border border-gray-200">
          {["customer", "products", "cart"].map(t => (
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

        {/* ... (keep your existing customer, products, and cart sections here) ... */}
        {/* For brevity, paste your existing tab content (customer, products, cart) from previous version */}
        {/* The only change is in submitSale function above + toast logic */}

        {/* Example placeholder for customer/products/cart sections */}
        {/* Replace with your full tab content */}
      </div>
    </div>
  );
};

export default Sales;
