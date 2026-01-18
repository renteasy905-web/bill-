import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Plus,
  Package,
  Receipt,
  FileText,
  AlertTriangle,
  LogOut,
  Pill,
  Users,
  LogIn,
  Loader2,
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
        window.history.replaceState(null, "", window.location.pathname);
      } else {
        setError("Invalid credentials");
      }
      setLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    navigate("/");
  };

  const premiumActions = [
    { title: "New Invoice", icon: Receipt, color: "from-blue-600 to-indigo-600", to: "/sales" },
    { title: "Add Product", icon: Plus, color: "from-emerald-600 to-teal-600", to: "/createProducts" },
    { title: "Inventory", icon: Package, color: "from-cyan-600 to-blue-600", to: "/allproducts" },
    { title: "Sales History", icon: Receipt, color: "from-purple-600 to-indigo-600", to: "/allsales" },
    { title: "Supplier Ledger", icon: FileText, color: "from-amber-600 to-orange-600", to: "/supplier-notes" },
    { title: "Alerts", icon: AlertTriangle, color: "from-rose-600 to-red-600", to: "/order-stock" },
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center p-5">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
              <Pill size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Vishwas Medical</h1>
            <p className="text-slate-300">Premium Pharmacy Management</p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-200 p-4 rounded-xl mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition-all"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition-all"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-2xl shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  Authenticating...
                </>
              ) : (
                "Secure Login"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-indigo-950 text-white">
      {/* Premium Header */}
      <header className="bg-black/30 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-2xl shadow-lg">
              <Pill size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Vishwas Medical
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-3 hover:bg-white/10 rounded-full transition">
              <Bell size={22} className="text-cyan-300" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-black"></span>
            </button>

            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-rose-600/80 hover:bg-rose-700 rounded-xl font-medium transition flex items-center gap-2"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Premium Dashboard */}
      <main className="max-w-6xl mx-auto px-5 py-12">
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
          Welcome to Your Dashboard
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
          {premiumActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={`group relative bg-gradient-to-br ${action.color} rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm border border-white/10`}
            >
              <div className="absolute inset-0 bg-black/10 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-white/15 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <action.icon size={40} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">{action.title}</h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Premium Floating Button */}
        <Link
          to="/createCustomer"
          className="fixed bottom-8 right-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full p-6 shadow-2xl shadow-cyan-900/40 hover:shadow-cyan-900/60 hover:scale-110 transition-all duration-300 z-50 flex items-center gap-3"
        >
          <Users size={28} />
          <span className="hidden sm:inline font-semibold">New Customer</span>
        </Link>
      </main>
    </div>
  );
};

export default First;
