import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Plus, Users, Package, ShoppingCart, Receipt, BarChart3, Pill, Bell } from "lucide-react";

const First = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Fixed Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-white hover:bg-slate-800 p-2 rounded-lg transition"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center space-x-3">
                <Pill className="text-indigo-400" size={32} />
                <h1 className="text-xl font-bold text-white">Vishwas Medical</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              <Link to="/createProducts" className="text-slate-300 hover:bg-slate-800 px-4 py-2 rounded-lg transition flex items-center gap-2">
                <Plus size={18} /> New Product
              </Link>
              <Link to="/allproducts" className="text-slate-300 hover:bg-slate-800 px-4 py-2 rounded-lg transition flex items-center gap-2">
                <Package size={18} /> Products
              </Link>
              <Link to="/cart" className="text-slate-300 hover:bg-slate-800 px-4 py-2 rounded-lg transition flex items-center gap-2">
                <ShoppingCart size={18} /> Billing Cart
              </Link>
              <Link to="/sales" className="text-slate-300 hover:bg-slate-800 px-4 py-2 rounded-lg transition flex items-center gap-2">
                <Receipt size={18} /> New Sale
              </Link>
              <Link to="/allsales" className="text-slate-300 hover:bg-slate-800 px-4 py-2 rounded-lg transition flex items-center gap-2">
                <BarChart3 size={18} /> Sales Report
              </Link>
            </nav>

            {/* Right side: Notification Bell + Create Customer Button */}
            <div className="flex items-center space-x-4">
              {/* Bell Icon with Notification Badge */}
              <Link
                to="/notifications"
                className="relative text-slate-300 hover:text-white hover:bg-slate-800 p-2 rounded-lg transition"
              >
                <Bell size={24} />
                {/* Example badge - you can make this dynamic later */}
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </Link>

              {/* Prominent Create Customer Button */}
              <Link
                to="/createCustomer"
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg transition transform hover:scale-105 flex items-center gap-2"
              >
                <Users size={20} />
                Create Customer
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar for Mobile */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 transform transition-transform duration-300 lg:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 space-y-4 mt-16">
          <Link to="/createProducts" onClick={() => setSidebarOpen(false)} className="block bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-medium flex items-center gap-3">
            <Plus size={20} /> New Product
          </Link>
          <Link to="/allproducts" onClick={() => setSidebarOpen(false)} className="block bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-medium flex items-center gap-3">
            <Package size={20} /> All Products
          </Link>
          <Link to="/cart" onClick={() => setSidebarOpen(false)} className="block bg-sky-600 hover:bg-sky-700 text-white py-3 px-4 rounded-xl font-medium flex items-center gap-3">
            <ShoppingCart size={20} /> Billing Cart
          </Link>
          <Link to="/notifications" onClick={() => setSidebarOpen(false)} className="block bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl font-medium flex items-center gap-3">
            <Bell size={20} /> Notifications
          </Link>
          <Link to="/createCustomer" onClick={() => setSidebarOpen(false)} className="block bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-xl font-medium flex items-center gap-3">
            <Users size={20} /> Create Customer
          </Link>
          <Link to="/sales" onClick={() => setSidebarOpen(false)} className="block bg-rose-600 hover:bg-rose-700 text-white py-3 px-4 rounded-xl font-medium flex items-center gap-3">
            <Receipt size={20} /> New Sale
          </Link>
          <Link to="/allsales" onClick={() => setSidebarOpen(false)} className="block bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium flex items-center gap-3">
            <BarChart3 size={20} /> Sales Report
          </Link>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <main className="pt-20 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-white mb-4">
              Welcome to Vishwas Medical Store
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Manage your pharmacy inventory, track expiry dates, create bills quickly, and maintain customer records with ease.
            </p>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl p-8 text-center hover:border-indigo-500 transition">
              <ShoppingCart className="mx-auto text-indigo-400 mb-4" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">Quick Billing</h3>
              <p className="text-slate-400">Add items to cart and generate bill instantly</p>
            </div>
            <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl p-8 text-center hover:border-emerald-500 transition">
              <Package className="mx-auto text-emerald-400 mb-4" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">Stock Management</h3>
              <p className="text-slate-400">Track expiry, low stock alerts</p>
            </div>
            <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl p-8 text-center hover:border-amber-500 transition">
              <Users className="mx-auto text-amber-400 mb-4" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">Customer Records</h3>
              <p className="text-slate-400">Save regular customers for faster billing</p>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Create Customer Button */}
      <Link
        to="/createCustomer"
        className="fixed bottom-8 right-8 z-40 bg-amber-500 hover:bg-amber-600 text-white rounded-full p-5 shadow-2xl transition transform hover:scale-110 hover:shadow-amber-500/50 flex items-center gap-3 text-lg font-bold"
      >
        <Users size={28} />
        <span className="hidden sm:inline">New Customer</span>
      </Link>

      {/* Overlay when sidebar open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default First;
