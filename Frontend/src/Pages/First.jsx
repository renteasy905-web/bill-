import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Plus,
  Package,
  ShoppingCart,
  Receipt,
  BarChart3,
  Users,
  Pill,
  AlertTriangle,
  LogIn,
  Loader2,
  LogOut,
  FileText,           // ← NEW icon for notes/pending
} from "lucide-react";

const First = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.removeItem("isLoggedIn");
    }
  }, [isLoggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (username.trim().toUpperCase() === "VMD" && password === "vmd@104") {
        localStorage.setItem("isLoggedIn", "true");
        setIsLoggedIn(true);
        window.history.replaceState({ loggedIn: true }, "", window.location.pathname);
      } else {
        setError("Invalid username or password");
      }
      setLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    setError("");
    navigate("/");
  };

  const quickActions = [
    {
      title: "New Bill",
      desc: "Create bills instantly",
      icon: Receipt,
      color: "rose",
      to: "/sales",
    },
    {
      title: "Edit items",
      desc: "Add items & checkout",
      icon: ShoppingCart,
      color: "sky",
      to: "/cart",
    },
    {
      title: "SEE All Products",
      desc: "Manage inventory & stock",
      icon: Package,
      color: "emerald",
      to: "/allproducts",
    },
    {
      title: "SEE All Bills",
      desc: "View analytics & trends",
      icon: BarChart3,
      color: "violet",
      to: "/allsales",
    },
    {
      title: "ADD Product",
      desc: "Add medicines & details",
      icon: Plus,
      color: "cyan",
      to: "/createProducts",
    },
    {
      title: "Order items",
      desc: "Low stock & expired items",
      icon: AlertTriangle,
      color: "orange",
      to: "/order-stock",
    },
    // ── NEW CARD ───────────────────────────────
    {
      title: "Supplier Notes",
      desc: "Pending amounts & last payments",
      icon: FileText,
      color: "amber",
      to: "/supplier-notes",
    },
  ];

  // Show login screen if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        {/* ... login form remains the same ... */}
      </div>
    );
  }

  // Logged-in dashboard (rest remains almost same, just quickActions updated)
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white overflow-hidden">
      {/* Header, Hero Section, etc. remain the same */}
      
      {/* Quick Action Cards */}
      <section className="max-w-7xl mx-auto px-4 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {quickActions.map((action, index) => (
            <Link
              key={action.to}
              to={action.to}
              className={`group relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl border border-white/10 overflow-hidden transition-all duration-500 hover:-translate-y-4 hover:shadow-3xl hover:border-${action.color}-500/50 hover:bg-gradient-to-br hover:from-slate-800 hover:to-slate-900`}
              style={{ animationDelay: `${index * 100}ms`, animation: "fadeInUp 0.8s ease-out forwards" }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-${action.color}-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-${action.color}-700/50 to-${action.color}-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <action.icon size={40} className={`text-${action.color}-300`} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{action.title}</h3>
                <p className="text-gray-400 group-hover:text-gray-200 transition-colors">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Floating New Customer Button */}
      <Link
        to="/createCustomer"
        className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full p-6 shadow-2xl shadow-amber-600/50 hover:shadow-amber-700/70 transition-all duration-300 transform hover:scale-110 flex items-center gap-3"
      >
        <Users size={28} />
        <span className="hidden sm:inline font-bold text-lg">New Customer</span>
      </Link>
    </div>
  );
};

export default First;
