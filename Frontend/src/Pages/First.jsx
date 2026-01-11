import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Plus, Users, Package, ShoppingCart, Receipt, BarChart3, Pill, Bell } from "lucide-react";

const First = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Header - Sleek & Minimal */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Mobile Toggle */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-cyan-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
              >
                {sidebarOpen ? <X size={26} /> : <Menu size={26} />}
              </button>

              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-indigo-600 to-cyan-600 p-2.5 rounded-xl shadow-lg">
                  <Pill size={28} className="text-white" />
                </div>
                <h1 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                  Vishwas Medical
                </h1>
              </div>
            </div>

            {/* Desktop Nav - Pill-shaped */}
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

            {/* Right: Bell + (Desktop) Customer Button */}
            <div className="flex items-center gap-6">
              <Link
                to="/notifications"
                className="relative p-2 rounded-full hover:bg-white/10 transition"
              >
                <Bell size={24} className="text-cyan-300 hover:text-cyan-200" />
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-pulse">
                  3
                </span>
              </Link>

              {/* Desktop-only Create Customer */}
              <Link
                to="/createCustomer"
                className="hidden lg:flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-full shadow-xl shadow-amber-500/30 hover:shadow-amber-600/50 transition-all duration-300 hover:scale-105"
              >
                <Users size={20} />
                New Customer
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar - Vertical, thumb-friendly */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-black/80 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full pt-20 px-5 pb-10">
          <div className="flex-1 space-y-3">
            {[
              { to: "/createProducts", icon: Plus, label: "New Product", color: "indigo" },
              { to: "/allproducts", icon: Package, label: "All Products", color: "emerald" },
              { to: "/cart", icon: ShoppingCart, label: "Billing Cart", color: "sky" },
              { to: "/notifications", icon: Bell, label: "Notifications", color: "purple" },
              { to: "/createCustomer", icon: Users, label: "New Customer", color: "amber" },
              { to: "/sales", icon: Receipt, label: "New Sale", color: "rose" },
              { to: "/allsales", icon: BarChart3, label: "Sales Report", color: "green" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-${item.color}-500/50 text-white font-medium transition-all duration-300 hover:shadow-${item.color}-500/20`}
              >
                <div className={`p-2.5 rounded-lg bg-${item.color}-900/40`}>
                  <item.icon size={22} className={`text-${item.color}-300`} />
                </div>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero */}
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

      {/* Modern Floating Action Button */}
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
