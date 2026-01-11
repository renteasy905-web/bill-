import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, X, Users, Package, ShoppingCart, Receipt, BarChart3, Pill, Bell } from "lucide-react";

const First = () => {
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);

  const toggleQuickMenu = () => {
    setQuickMenuOpen((prev) => !prev);
  };

  const menuItems = [
    { to: "/allsales", icon: BarChart3, label: "Sales Report", color: "indigo" },
    { to: "/createCustomer", icon: Users, label: "New Customer", color: "amber" },
    { to: "/sales", icon: Receipt, label: "New Sale", color: "rose" },
    { to: "/createProducts", icon: Plus, label: "New Product", color: "cyan" },
    { to: "/cart", icon: ShoppingCart, label: "Billing Cart", color: "sky" },
    { to: "/allproducts", icon: Package, label: "Products", color: "emerald" },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-xl shadow-lg">
                <Pill size={28} className="text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                Vishwas Medical
              </h1>
            </div>

            {/* Notification Bell */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-full hover:bg-white/10 transition"
            >
              <Bell size={24} className="text-cyan-300 hover:text-cyan-200" />
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-pulse">
                3
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-20 pb-32 flex flex-col items-center justify-center min-h-[80vh]">
        <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-300 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-6 text-center px-4">
          Vishwas Medical
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto text-center px-4">
          Fast billing • Smart inventory • Expiry alerts • Loyal customers
        </p>
      </main>

      {/* Floating + Button (Bottom Left) */}
      <button
        onClick={toggleQuickMenu}
        className={`fixed bottom-8 left-8 z-50 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          quickMenuOpen
            ? "bg-rose-600 hover:bg-rose-700 rotate-45"
            : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        } text-white hover:scale-110`}
      >
        {quickMenuOpen ? <X size={28} /> : <Plus size={28} />}
      </button>

      {/* Circular Quick Menu (Exactly like your screenshot) */}
      {quickMenuOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-[400px] h-[400px]">
            {/* Center Close Button */}
            <button
              onClick={toggleQuickMenu}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-800 to-purple-900 flex items-center justify-center text-white shadow-2xl border-4 border-white/20 hover:scale-105 transition"
            >
              <X size={40} />
            </button>

            {/* Circular Arranged Buttons */}
            {menuItems.map((item, index) => {
              const angle = (index / menuItems.length) * 360;
              const radius = 160; // Adjust this for size of circle
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={toggleQuickMenu}
                  className="absolute top-1/2 left-1/2 transform transition-all duration-500 hover:scale-110"
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    animation: `expand 0.7s ease-out forwards ${index * 0.08}s`,
                  }}
                >
                  <div
                    className={`w-28 h-28 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl bg-gradient-to-br from-${item.color}-700 to-${item.color}-900 border border-white/20 hover:border-white/40 hover:shadow-2xl`}
                  >
                    <item.icon size={36} className="mb-2" />
                    <span className="text-xs font-medium text-center px-2 leading-tight">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default First;
