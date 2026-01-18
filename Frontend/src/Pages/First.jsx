import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Plus,
  Package,
  ShoppingCart,
  Receipt,
  DollarSign,
  Users,
  Pill,
  AlertTriangle,
  LogIn,
  Loader2,
  LogOut,
  Search,
  FileText,
  TrendingUp,
  Clock,
  AlertCircle,
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

  // Quick action buttons (like billing software sidebar)
  const quickActions = [
    { title: "New Bill", desc: "Create new sale", icon: Receipt, color: "blue", to: "/sales" },
    { title: "Add Medicine", desc: "New product entry", icon: Plus, color: "green", to: "/createProducts" },
    { title: "All Products", desc: "Manage stock", icon: Package, color: "emerald", to: "/allproducts" },
    { title: "All Bills", desc: "Sales history", icon: Receipt, color: "indigo", to: "/allsales" },
    { title: "Supplier Notes", desc: "Pending payments", icon: FileText, color: "amber", to: "/supplier-notes" },
    { title: "Low Stock / Expiry", desc: "Alerts & orders", icon: AlertTriangle, color: "orange", to: "/order-stock" },
  ];

  // Dummy stats (you'll replace with real API data later)
  const stats = [
    { title: "Today's Sales", value: "₹42,850", icon: DollarSign, color: "green" },
    { title: "Pending Bills", value: "12", icon: Clock, color: "orange" },
    { title: "Low Stock Items", value: "8", icon: AlertCircle, color: "red" },
    { title: "Expiry Soon", value: "5", icon: Clock, color: "purple" },
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8">
          <div className="text-center mb-8">
            <Pill size={64} className="mx-auto text-cyan-400 mb-4" />
            <h1 className="text-4xl font-bold text-white">Vishwas Medical</h1>
            <p className="text-slate-400 mt-2">Pharmacy Billing Software</p>
          </div>
          {error && <p className="text-red-400 text-center mb-6">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="text"
              placeholder="Username (VMD)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 transition"
              required
            />
            <input
              type="password"
              placeholder="Password (vmd@104)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 transition"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  Please wait...
                </>
              ) : (
                "Login to Billing"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Pill size={32} className="text-cyan-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Vishwas Medical
              </h1>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search medicines, bills..."
                  className="w-64 pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-cyan-500 transition"
                />
                <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
              </div>

              <button className="relative p-2 hover:bg-slate-800 rounded-full transition">
                <Bell size={22} className="text-cyan-400" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  5
                </span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-700 rounded-lg transition"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-700/50 transition-all hover:shadow-lg hover:shadow-cyan-900/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-900/40`}>
                  <stat.icon size={28} className={`text-${stat.color}-400`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions - Main Billing Features */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-cyan-300">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={action.to}
                to={action.to}
                className={`group bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 hover:border-${action.color}-600/50 hover:shadow-xl hover:shadow-${action.color}-900/20 transition-all duration-300`}
              >
                <div className={`w-14 h-14 rounded-xl bg-${action.color}-900/40 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <action.icon size={28} className={`text-${action.color}-400`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{action.title}</h3>
                <p className="text-slate-400 text-sm">{action.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Floating Add Customer Button */}
        <Link
          to="/createCustomer"
          className="fixed bottom-8 right-8 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-full p-5 shadow-2xl shadow-cyan-900/40 transition-all hover:scale-110 flex items-center gap-3 z-50"
        >
          <Users size={24} />
          <span className="hidden sm:inline font-medium">New Customer</span>
        </Link>
      </main>
    </div>
  );
};

export default First;
