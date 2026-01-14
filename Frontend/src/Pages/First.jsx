// src/Pages/First.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // ← added useNavigate for logout redirect
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
    navigate("/"); // ← redirect to login/home after logout
  };

  const quickActions = [
    {
      title: "New Sale",
      desc: "Create bills instantly",
      icon: Receipt,
      color: "rose",
      to: "/sales",
    },
    {
      title: "Billing Cart",
      desc: "Add items & checkout",
      icon: ShoppingCart,
      color: "sky",
      to: "/cart",
    },
    {
      title: "All Products",
      desc: "Manage inventory & stock",
      icon: Package,
      color: "emerald",
      to: "/allproducts",
    },
    {
      title: "Sales Report",
      desc: "View analytics & trends",
      icon: BarChart3,
      color: "violet",
      to: "/allsales",
    },
    {
      title: "New Product",
      desc: "Add medicines & details",
      icon: Plus,
      color: "cyan",
      to: "/createProducts",
    },
    {
      title: "Order Stock",
      desc: "Low stock & expired items",
      icon: AlertTriangle,
      color: "orange",
      to: "/order-stock",
    },
  ];

  // Show login screen if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800/70 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-700/50 p-8">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl mb-4">
              <Pill size={48} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
              Vishwas Medical
            </h1>
            <p className="text-slate-300 mt-2">Please sign in to continue</p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-center mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="text"
              placeholder="Username (VMD)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              required
              autoFocus
            />

            <input
              type="password"
              placeholder="Password (vmd@104)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-3 disabled:opacity-60 ${
                loading ? "cursor-wait" : ""
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={22} />
                  Login
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Demo credentials: <strong>VMD</strong> / <strong>vmd@104</strong>
          </p>
        </div>
      </div>
    );
  }

  // Logged-in dashboard
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white overflow-hidden">
      {/* Header with Logout */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg">
                <Pill size={28} className="text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                Vishwas Medical
              </h1>
            </div>

            <div className="flex items-center gap-6">
              <Link
                to="/notifications"
                className="relative p-3 rounded-full hover:bg-white/10 transition"
              >
                <Bell size={24} className="text-cyan-300 hover:text-cyan-200" />
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-pulse">
                  3
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="px-5 py-2 bg-rose-600/80 hover:bg-rose-700 text-white rounded-lg font-medium transition flex items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-cyan-300 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-6 tracking-tight">
          Vishwas Medical
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
          Fast billing • Smart stock • Expiry alerts • Loyal customers
        </p>
      </section>

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