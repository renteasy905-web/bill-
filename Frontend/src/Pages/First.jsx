import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Plus,
  Package,
  ShoppingCart,
  Receipt,
  FileText,
  AlertTriangle,
  LogIn,
  Loader2,
  LogOut,
  Pill,
  Users,
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

  // Simplified & attractive quick actions
  const quickActions = [
    {
      title: "New Sale",
      desc: "Create new bill",
      icon: Receipt,
      color: "blue",
      to: "/sales",
    },
    {
      title: "Add Medicine",
      desc: "New product",
      icon: Plus,
      color: "green",
      to: "/createProducts",
    },
    {
      title: "Stock",
      desc: "All medicines",
      icon: Package,
      color: "emerald",
      to: "/allproducts",
    },
    {
      title: "Bills History",
      desc: "View all sales",
      icon: Receipt,
      color: "indigo",
      to: "/allsales",
    },
    {
      title: "Suppliers",
      desc: "Pending & notes",
      icon: FileText,
      color: "amber",
      to: "/supplier-notes",
    },
    {
      title: "Alerts",
      desc: "Low stock / Expiry",
      icon: AlertTriangle,
      color: "orange",
      to: "/order-stock",
    },
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Pill size={32} className="text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Vishwas Medical</h1>
            <p className="text-gray-500 mt-1">Billing & Inventory</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:bg-blue-400 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Pill size={32} className="text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">Vishwas Medical</h1>
            </div>

            <div className="flex items-center gap-6">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell size={22} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Dashboard</h2>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-200 border border-gray-200 overflow-hidden group"
            >
              <div className="p-8">
                <div className={`w-14 h-14 rounded-xl bg-${action.color}-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <action.icon size={28} className={`text-${action.color}-600`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{action.title}</h3>
                <p className="text-gray-600">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Floating New Customer Button */}
        <Link
          to="/createCustomer"
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-5 shadow-lg transition-transform hover:scale-110 flex items-center gap-3 z-50"
        >
          <Users size={24} />
          <span className="font-medium hidden sm:inline">New Customer</span>
        </Link>
      </main>
    </div>
  );
};

export default First;
