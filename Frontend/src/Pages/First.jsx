import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Plus, Users, Package, ShoppingCart, Receipt, BarChart3, Pill, Bell } from "lucide-react";

const First = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Modern Fixed Header with Glass Effect */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Mobile Menu Toggle */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-cyan-300 hover:text-cyan-200 p-2 rounded-lg transition"
              >
                {sidebarOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-indigo-600 to-cyan-600 p-2 rounded-xl shadow-lg">
                  <Pill size={28} className="text-white" />
                </div>
                <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                  Vishwas Medical
                </h1>
              </div>
            </div>

            {/* Desktop Navigation - Neon Hover Effect */}
            <nav className="hidden lg:flex items-center space-x-2">
              {[
                { to: "/createProducts", label: "New Product", icon: Plus, color: "cyan" },
                { to: "/allproducts", label: "Products", icon: Package, color: "emerald" },
                { to: "/cart", label: "Billing Cart", icon: ShoppingCart, color: "sky" },
                { to: "/sales", label: "New Sale", icon: Receipt, color: "rose" },
                { to: "/allsales", label: "Sales Report", icon: BarChart3, color: "violet" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-gray-300 hover:text-${item.color}-300 px-4 py-2 rounded-lg transition flex items-center gap-2 hover:bg-white/10 hover:shadow-sm hover:shadow-${item.color}-500/30`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right Side - Notification + FAB Style Create Customer */}
            <div className="flex items-center space-x-6">
              <Link
                to="/notifications"
                className="relative text-cyan-300 hover:text-cyan-200 p-2 rounded-full hover:bg-white/10 transition"
              >
                <Bell size={24} />
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-pulse">
                  3
                </span>
              </Link>

              <Link
                to="/createCustomer"
                className="hidden lg:flex bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-6 py-2.5 rounded-full shadow-xl shadow-amber-500/30 hover:shadow-amber-600/50 transition transform hover:scale-105 flex items-center gap-2"
              >
                <Users size={20} />
                New Customer
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar - Glassmorphic Slide-in */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-black/70 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 space-y-4 mt-16">
          {[
            { to: "/createProducts", label: "New Product", icon: Plus, color: "indigo" },
            { to: "/allproducts", label: "All Products", icon: Package, color: "emerald" },
            { to: "/cart", label: "Billing Cart", icon: ShoppingCart, color: "sky" },
            { to: "/notifications", label: "Notifications", icon: Bell, color: "purple" },
            { to: "/createCustomer", label: "New Customer", icon: Users, color: "amber" },
            { to: "/sales", label: "New Sale", icon: Receipt, color: "rose" },
            { to: "/allsales", label: "Sales Report", icon: BarChart3, color: "green" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`block bg-gradient-to-r from-${item.color}-900/70 to-${item.color}-800/50 hover:from-${item.color}-800 hover:to-${item.color}-700 text-white py-4 px-5 rounded-xl font-medium flex items-center gap-4 shadow-md transition-all hover:scale-[1.02] hover:shadow-${item.color}-500/30`}
            >
              <item.icon size={22} />
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Overlay for Mobile Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Hero + Dashboard Content */}
      <main className="pt-20 min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16 relative">
            <div className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent" />
            <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent mb-6 tracking-tight">
              Vishwas Medical
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Your modern pharmacy companion — fast billing, smart inventory, expiry tracking, and loyal customers management.
            </p>
          </div>

          {/* Quick Action Cards - Glassmorphism + Animation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Quick Billing",
                desc: "Add items & generate bills in seconds",
                icon: ShoppingCart,
                color: "cyan",
                link: "/cart",
              },
              {
                title: "Stock Control",
                desc: "Low stock & expiry alerts in one glance",
                icon: Package,
                color: "emerald",
                link: "/allproducts",
              },
              {
                title: "Customer Hub",
                desc: "Save regulars for lightning-fast checkout",
                icon: Users,
                color: "amber",
                link: "/createCustomer",
              },
            ].map((card, i) => (
              <Link
                key={card.title}
                to={card.link}
                className={`group bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center transition-all duration-500 hover:border-${card.color}-500/50 hover:shadow-xl hover:shadow-${card.color}-900/30 hover:-translate-y-2 animate-fade-in`}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className={`mx-auto bg-gradient-to-br from-${card.color}-900/50 to-${card.color}-800/30 p-5 rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
                  <card.icon className={`text-${card.color}-400`} size={48} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{card.title}</h3>
                <p className="text-gray-400 group-hover:text-gray-200 transition-colors">{card.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Floating Action Button - Modern FAB Style */}
      <Link
        to="/createCustomer"
        className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full p-5 shadow-2xl shadow-amber-600/40 hover:shadow-amber-700/60 transition-all duration-300 transform hover:scale-110 flex items-center gap-3"
      >
        <Users size={28} />
        <span className="hidden sm:inline font-semibold">New Customer</span>
      </Link>
    </>
  );
};

export default First;
