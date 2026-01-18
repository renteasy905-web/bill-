import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  LogOut,
  Search,
  Plus,
  Receipt,
  ShoppingBag,
  FileText,
  BarChart2,
  Users,
  Bell,
} from "lucide-react";

const First = () => {
  const navigate = useNavigate();
  const [isLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // No products = empty state (no text, no illustration, just plain background)
  const products = [];

  if (!isLoggedIn) {
    // Keep your existing login code here or redirect
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Login Required</div>;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      {/* ── TOP BAR (exact match) ──────────────────────────────────── */}
      <header className="bg-[#1e293b] px-4 py-3 flex items-center justify-between border-b border-gray-700 sticky top-0 z-20">
        {/* 3-line menu button */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-700/50"
        >
          <Menu size={28} />
        </button>

        <h1 className="text-xl md:text-2xl font-bold tracking-wide">
          VISHWAS MEDICAL
        </h1>

        <div className="flex items-center gap-5">
          {/* Notification bell with red dot */}
          <Link to="/notifications" className="relative p-2">
            <Bell size={24} />
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1e293b]"></span>
          </Link>

          <button
            onClick={() => {
              localStorage.removeItem("isLoggedIn");
              navigate("/");
            }}
            className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
          >
            Logout →
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ───────────────────────────────────────────── */}
      <main className="flex-1 px-4 py-6 pb-28">
        {/* Add Bill / Bills segmented control */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
          <button className="px-8 py-3 bg-cyan-500 text-white font-medium rounded-full shadow-md whitespace-nowrap">
            Add Bill
          </button>
          <button className="px-8 py-3 bg-gray-700/50 text-gray-300 font-medium rounded-full whitespace-nowrap">
            Bills
          </button>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-12 pr-14 py-4 bg-gray-800 border border-gray-700 rounded-full text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Link
            to="/createProducts"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-cyan-500 text-white p-3 rounded-full shadow-md hover:bg-cyan-600 transition"
          >
            <Plus size={20} />
          </Link>
        </div>

        {/* Products Section - exact empty look (no text, no illustration) */}
        <div className="bg-gray-800/70 rounded-2xl shadow-md p-6 min-h-[50vh] border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-cyan-300">Products</h2>
            <button className="text-gray-400">•••</button>
          </div>

          {/* Completely plain - no message, no image, just empty space */}
        </div>
      </main>

      {/* ── BOTTOM NAVIGATION BAR (exact match) ────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1e293b] border-t border-gray-700 shadow-2xl z-10">
        <div className="max-w-md mx-auto px-2 py-3 flex items-center justify-around">
          <Link to="/sales" className="flex flex-col items-center text-cyan-400">
            <Receipt size={28} />
            <span className="text-xs mt-1">Create Bill</span>
          </Link>

          <Link to="/createProducts" className="flex flex-col items-center text-gray-400">
            <ShoppingBag size={28} />
            <span className="text-xs mt-1">Add Product</span>
          </Link>

          <Link to="/createCustomer" className="flex flex-col items-center text-gray-400">
            <Users size={28} />
            <span className="text-xs mt-1">Add Customer</span>
          </Link>

          <Link to="/supplier-notes" className="flex flex-col items-center text-gray-400">
            <FileText size={28} />
            <span className="text-xs mt-1">Supplier Notes</span>
          </Link>

          <Link to="/allsales" className="flex flex-col items-center text-gray-400">
            <BarChart2 size={28} />
            <span className="text-xs mt-1">All Sales</span>
          </Link>
        </div>
      </nav>

      {/* ── SIDE DRAWER (3-line menu) ─────────────────────────────── */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="fixed top-0 left-0 h-full w-80 bg-gray-900 border-r border-gray-700 p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-cyan-300">Menu</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-white">
                <X size={28} />
              </button>
            </div>

            <div className="space-y-2">
              <Link to="/sales" className="flex items-center gap-4 p-4 hover:bg-gray-800 rounded-xl" onClick={() => setIsDrawerOpen(false)}>
                <Receipt size={24} /> Create Bill
              </Link>
              <Link to="/allproducts" className="flex items-center gap-4 p-4 hover:bg-gray-800 rounded-xl" onClick={() => setIsDrawerOpen(false)}>
                <Package size={24} /> All Products
              </Link>
              <Link to="/createProducts" className="flex items-center gap-4 p-4 hover:bg-gray-800 rounded-xl" onClick={() => setIsDrawerOpen(false)}>
                <Plus size={24} /> Add Product
              </Link>
              <Link to="/createCustomer" className="flex items-center gap-4 p-4 hover:bg-gray-800 rounded-xl" onClick={() => setIsDrawerOpen(false)}>
                <Users size={24} /> Add Customer
              </Link>
              <Link to="/supplier-notes" className="flex items-center gap-4 p-4 hover:bg-gray-800 rounded-xl" onClick={() => setIsDrawerOpen(false)}>
                <FileText size={24} /> Supplier Notes
              </Link>
              <Link to="/allsales" className="flex items-center gap-4 p-4 hover:bg-gray-800 rounded-xl" onClick={() => setIsDrawerOpen(false)}>
                <BarChart2 size={24} /> All Sales
              </Link>
              <Link to="/notifications" className="flex items-center gap-4 p-4 hover:bg-gray-800 rounded-xl" onClick={() => setIsDrawerOpen(false)}>
                <Bell size={24} /> Notifications
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default First;
