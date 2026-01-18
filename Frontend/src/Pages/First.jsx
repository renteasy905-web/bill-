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
        setError("Wrong username or password");
      }
      setLoading(false);
    }, 700);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    navigate("/");
  };

  const actions = [
    { title: "New Bill", icon: Receipt, color: "bg-blue-100 text-blue-700", to: "/sales" },
    { title: "Add Medicine", icon: Plus, color: "bg-green-100 text-green-700", to: "/createProducts" },
    { title: "All Medicines", icon: Package, color: "bg-emerald-100 text-emerald-700", to: "/allproducts" },
    { title: "All Bills", icon: Receipt, color: "bg-indigo-100 text-indigo-700", to: "/allsales" },
    { title: "Supplier Notes", icon: FileText, color: "bg-amber-100 text-amber-700", to: "/supplier-notes" },
    { title: "Low Stock", icon: AlertTriangle, color: "bg-orange-100 text-orange-700", to: "/order-stock" },
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
              <Pill size={32} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Vishwas Medical</h1>
            <p className="text-gray-500 mt-1">Billing & Stock</p>
          </div>

          {error && <p className="text-red-600 text-center mb-6">{error}</p>}

          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:bg-blue-400 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Please wait...
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
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Top Bar */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Pill size={28} className="text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">Vishwas Medical</h1>
          </div>

          <div className="flex items-center gap-5">
            <button className="relative p-2">
              <Bell size={22} className="text-gray-600" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full" />
            </button>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Very Simple & Phone Friendly */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {actions.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`${item.color} rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:opacity-90 transition-opacity active:scale-95 shadow-sm`}
            >
              <item.icon size={36} className="mb-4" />
              <span className="font-medium text-gray-800">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Floating Button - Very common in mobile apps */}
      <Link
        to="/createCustomer"
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-5 shadow-lg hover:bg-blue-700 transition-transform active:scale-95 z-50"
      >
        <Users size={28} />
      </Link>
    </div>
  );
};

export default First;
