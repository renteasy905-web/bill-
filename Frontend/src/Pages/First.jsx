import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, X, Users, Package, ShoppingCart, Receipt, BarChart3, Pill, Bell } from "lucide-react";

const First = () => {
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);

  const toggleQuickMenu = () => {
    setQuickMenuOpen((prev) => !prev);
  };

  const menuItems = [
    { to: "/createProducts", icon: Plus, label: "New Product", color: "indigo" },
    { to: "/allproducts", icon: Package, label: "Products", color: "emerald" },
    { to: "/cart", icon: ShoppingCart, label: "Billing Cart", color: "sky" },
    { to: "/sales", icon: Receipt, label: "New Sale", color: "rose" },
    { to: "/allsales", icon: BarChart3, label: "Sales Report", color: "violet" },
    { to: "/createCustomer", icon: Users, label: "New Customer", color: "amber" },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Header - Clean & Minimal */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-cyan-600 p-2.5 rounded-xl shadow-lg">
                <Pill size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                Vishwas Medical
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-3">
              {[
                { to: "/createProducts", icon: Plus, label: "New Product", color: "cyan" },
                { to: "/allproducts", icon: Package, label: "Products", color: "emerald" },
                { to: "/cart", icon: ShoppingCart, label: "Billing Cart", color: "sky" },
                { to: "/sales", icon: Receipt, label: "New Sale", color: "rose" },
                { to: "/allsales", icon: BarChart3, label: "Sales Report", color: "violet" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-gray-200 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 hover:border-${item.color}-500/50 transition-all duration-300 shadow-sm hover:shadow-${item.color}-500/20`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Notification Bell */}
            <div className="flex items-center">
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
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-300 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-6">
              Vishwas Medical
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Fast billing • Smart inventory • Expiry alerts • Loyal customers
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Quick Billing", desc: "Create bills in seconds", icon: ShoppingCart, color: "cyan", link: "/cart" },
              { title: "Stock Management", desc: "Track low stock & expiry", icon: Package, color: "emerald", link: "/allproducts" },
              { title: "Customers", desc: "Manage regulars easily", icon: Users, color: "amber", link: "/createCustomer" },
            ].map((card, i) => (
              <Link
                key={card.title}
                to={card.link}
                className={`group bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center transition-all duration-500 hover:border-${card.color}-500/50 hover:shadow-2xl hover:shadow-${card.color}-900/30 hover:-translate-y-3`}
              >
                <div className={`mx-auto bg-gradient-to-br from-${card.color}-900/50 to-${card.color}-800/30 p-6 rounded-2xl mb-6 w-24 h-24 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <card.icon className={`text-${card.color}-300`} size={48} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{card.title}</h3>
                <p className="text-gray-400 group-hover:text-gray-200">{card.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Quick Menu Toggle Button (Bottom Left + Icon) */}
      <button
        onClick={toggleQuickMenu}
        className={`fixed bottom-8 left-8 z-50 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          quickMenuOpen
            ? "bg-rose-600 hover:bg-rose-700"
            : "bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
        } text-white hover:scale-110`}
      >
        {quickMenuOpen ? <X size={28} /> : <Plus size={28} />}
      </button>

      {/* Quick Menu - Expanding Circular Buttons */}
      {quickMenuOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative">
            {menuItems.map((item, index) => {
              const angle = (index / menuItems.length) * 360;
              const radius = 140; // distance from center
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={toggleQuickMenu}
                  className={`absolute transform transition-all duration-500 ease-out hover:scale-110`}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    animation: `expand ${0.4 + index * 0.1}s ease-out`,
                  }}
                >
                  <div
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-${item.color}-700 to-${item.color}-900 text-white shadow-xl hover:shadow-2xl w-24 h-24`}
                  >
                    <item.icon size={32} />
                    <span className="text-xs font-medium text-center">{item.label}</span>
                  </div>
                </Link>
              );
            })}

            {/* Center Close Button */}
            <button
              onClick={toggleQuickMenu}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white shadow-xl hover:bg-white/20 transition"
            >
              <X size={32} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default First;
