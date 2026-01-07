import React, { useState } from "react";
import { Link } from "react-router-dom";

const First = () => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="min-h-screen relative flex items-center justify-center px-4"
      style={{
        backgroundImage:
          "url('https://plus.unsplash.com/premium_photo-1678139620956-cbd87b6ba3d0?w=1600&auto=format&fit=crop&q=60')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Hamburger Button */}
      <button
        onClick={() => setOpen(true)}
        className="absolute top-4 left-4 z-20 text-white text-3xl"
      >
        ☰
      </button>

      {/* Side Navigation */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-black/90 z-30 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 space-y-4">
          <button
            onClick={() => setOpen(false)}
            className="text-white text-xl mb-6"
          >
            ✕ Close
          </button>

          <Link
            to="/createProducts"
            onClick={() => setOpen(false)}
            className="block bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-semibold"
          >
            ➕ Create Product
          </Link>

          <Link
            to="/allproducts"
            onClick={() => setOpen(false)}
            className="block bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-semibold"
          >
            📦 All Products / Expiry
          </Link>

          <Link
            to="/cart"
            onClick={() => setOpen(false)}
            className="block bg-sky-600 hover:bg-sky-700 text-white py-3 px-4 rounded-xl font-semibold"
          >
            🛒 Inventory Cart
          </Link>

          <Link
            to="/createCustomer"
            onClick={() => setOpen(false)}
            className="block bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-xl font-semibold"
          >
            👤 Create Customer
          </Link>

          <Link
            to="/sales"
            onClick={() => setOpen(false)}
            className="block bg-rose-600 hover:bg-rose-700 text-white py-3 px-4 rounded-xl font-semibold"
          >
            💰 Sales
          </Link>

          <Link
            to="/allsales"
            onClick={() => setOpen(false)}
            className="block bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-semibold"
          >
            📊 All Sales
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md space-y-6 text-center">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Inventory Control Panel
        </h1>

        <p className="text-slate-300 text-sm">
          Products • Sales • Customers • Expiry Tracking
        </p>

       ]
      </div>
    </div>
  );
};

export default First;