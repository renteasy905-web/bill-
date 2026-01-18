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
  X,
  Package,
} from "lucide-react";

const First = () => {
  const navigate = useNavigate();
  const [isLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const products = [];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
        Login Required
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white flex flex-col bg-gradient-to-b from-[#0c1b29] via-[#112637] to-[#0d1f2f]">
      {/* ────────────────────── TOP BAR ────────────────────── */}
      <header className="bg-[#112637]/70 backdrop-blur-xl px-4 py-3 flex items-center justify-between border-b border-white/10 sticky top-0 z-20 shadow-lg">
        {/* 3-line menu */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 rounded-lg hover:bg-white/10 transition"
        >
          <Menu size={28} />
        </button>

        {/* Title */}
        <h1 className="text-xl md:text-2xl font-bold tracking-wide text-white drop-shadow">
          VISHWAS MEDICAL
        </h1>

        {/* Right buttons */}
        <div className="flex items-center gap-5">
          {/* Notification bell */}
          <Link to="/notifications" className="relative p-2">
            <Bell size={24} className="text-white" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#112637]"></span>
          </Link>

          {/* Logout */}
          <button
            onClick={() => {
              localStorage.removeItem("isLoggedIn");
              navigate("/");
            }}
            className="px-4 py-2 bg-[#ffe7d4] text-[#2b2b2b] font-semibold rounded-xl shadow-md hover:bg-[#ffddc1] transition flex items-center gap-1"
          >
            Logout →
          </button>
        </div>
      </header>

      {/* ────────────────────── MAIN CONTENT ────────────────────── */}
      <main className="flex-1 px-4 py-6 pb-32">
        {/* ADD BILL / BILLS TABS */}
        <div className="flex items-center gap-4 mb-6">
          <button className="px-8 py-3 bg-gradient-to-r from-[#5ad4d9] to-[#77e1c8] text-[#0b1e2a] font-semibold rounded-full shadow-xl">
            Add Bill
          </button>

          <button className="px-8 py-3 bg-white/10 text-white/70 font-medium rounded-full backdrop-blur-xl border border-white/10 shadow">
            Bills
          </button>
        </div>

        {/* PREMIUM SEARCH BAR */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-12 pr-14 py-4 bg-white/10 border border-white/10 backdrop-blur-xl rounded-full text-base placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/40 shadow-lg"
          />
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
          />
          <Link
            to="/createProducts"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#50d8df] to-[#87e7cb] text-[#0a1c27] p-3 rounded-full shadow-lg hover:scale-105 transition"
          >
            <Plus size={20} />
          </Link>
        </div>

        {/* PRODUCTS CARD (GLASS EFFECT) */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 min-h-[50vh] border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#86e7d0]">Products</h2>
            <button className="text-white/60 text-xl">•••</button>
          </div>

          {/* EMPTY STATE (NO TEXT / NO IMAGE) */}
        </div>
      </main>

      {/* ────────────────────── BOTTOM NAVIGATION ────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#112637]/70 backdrop-blur-xl border-t border-white/10 shadow-2xl z-20">
        <div className="max-w-md mx-auto px-2 py-3 flex items-center justify-around">
          <Link to="/sales" className="flex flex-col items-center text-[#86e7d0]">
            <Receipt size={26} />
            <span className="text-xs mt-1">Create Bill</span>
          </Link>

          <Link to="/createProducts" className="flex flex-col items-center text-white/60">
            <ShoppingBag size={26} />
            <span className="text-xs mt-1">Add Product</span>
          </Link>

          <Link to="/createCustomer" className="flex flex-col items-center text-white/60">
            <Users size={26} />
            <span className="text-xs mt-1">Add Customer</span>
          </Link>

          <Link to="/supplier-notes" className="flex flex-col items-center text-white/60">
            <FileText size={26} />
            <span className="text-xs mt-1">Supplier Notes</span>
          </Link>

          <Link to="/allsales" className="flex flex-col items-center text-white/60">
            <BarChart2 size={26} />
            <span className="text-xs mt-1">All Sales</span>
          </Link>
        </div>
      </nav>

      {/* ────────────────────── SIDE DRAWER ────────────────────── */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="fixed top-0 left-0 h-full w-80 bg-[#0f172a] border-r border-white/10 p-6 overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#86e7d0]">Menu</h2>
              <button onClick={() => setIsDrawerOpen(false)}>
                <X size={28} className="text-white/70 hover:text-white" />
              </button>
            </div>

            <div className="space-y-3">
              <Link
                to="/sales"
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition"
                onClick={() => setIsDrawerOpen(false)}
              >
                <Receipt size={24} /> Create Bill
              </Link>

              <Link
                to="/allproducts"
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition"
                onClick={() => setIsDrawerOpen(false)}
              >
                <Package size={24} /> All Products
              </Link>

              <Link
                to="/createProducts"
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition"
                onClick={() => setIsDrawerOpen(false)}
              >
                <Plus size={24} /> Add Product
              </Link>

              <Link
                to="/createCustomer"
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition"
                onClick={() => setIsDrawerOpen(false)}
              >
                <Users size={24} /> Add Customer
              </Link>

              <Link
                to="/supplier-notes"
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition"
                onClick={() => setIsDrawerOpen(false)}
              >
                <FileText size={24} /> Supplier Notes
              </Link>

              <Link
                to="/allsales"
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition"
                onClick={() => setIsDrawerOpen(false)}
              >
                <BarChart2 size={24} /> All Sales
              </Link>

              <Link
                to="/notifications"
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition"
                onClick={() => setIsDrawerOpen(false)}
              >
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
