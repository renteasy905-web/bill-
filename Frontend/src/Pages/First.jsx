import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  LogOut,
  Search,
  Plus,
  Home,
  ShoppingBag,
  FileText,
  BarChart2,
  Bell,
} from "lucide-react";

const First = () => {
  const navigate = useNavigate();
  const [isLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");

  // Dummy state - later you'll fetch real products from backend
  const [products] = useState([]); // Replace with real fetch later

  if (!isLoggedIn) {
    // Your existing login screen code here (kept minimal)
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center p-6">
          <h1 className="text-3xl font-bold">Please Login</h1>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Menu size={28} className="text-gray-700" />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-blue-700">
            VISHWAS MEDICAL
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Bell with Red Dot */}
          <Link to="/notifications" className="relative p-2">
            <Bell size={24} className="text-gray-700" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          </Link>

          <button
            onClick={() => {
              localStorage.removeItem("isLoggedIn");
              navigate("/");
            }}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            Logout →
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 pb-24">
        {/* Add Bill & Bills Tabs */}
        <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
          <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full whitespace-nowrap shadow-md">
            Add Bill
          </button>
          <button className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-full whitespace-nowrap">
            Bills
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-12 pr-14 py-4 bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full shadow-md">
            <Plus size={20} />
          </button>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Products</h2>
            <button className="text-blue-600 hover:text-blue-800">•••</button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <div className="text-blue-500">
                  <ShoppingBag size={48} />
                </div>
              </div>
              <p className="text-gray-600 mb-6">No products added yet</p>
              <button className="px-8 py-4 bg-blue-600 text-white font-medium rounded-full shadow-md hover:bg-blue-700 transition">
                + Add Product
              </button>
            </div>
          ) : (
            // Later: show product cards/list here
            <p className="text-center text-gray-500">Products will appear here</p>
          )}
        </div>
      </main>

      {/* Bottom Navigation - Mobile Style */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
        <div className="max-w-3xl mx-auto px-4 py-2 flex items-center justify-around">
          <Link to="/" className="flex flex-col items-center text-blue-600">
            <Home size={28} />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>

          <Link to="/createProducts" className="flex flex-col items-center text-gray-600">
            <Plus size={28} />
            <span className="text-xs mt-1">Add Product</span>
          </Link>

          <Link to="/supplier-notes" className="flex flex-col items-center text-gray-600">
            <FileText size={28} />
            <span className="text-xs mt-1">Supplier Notes</span>
          </Link>

          <Link to="/allsales" className="flex flex-col items-center text-gray-600">
            <BarChart2 size={28} />
            <span className="text-xs mt-1">All Sales</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default First;
