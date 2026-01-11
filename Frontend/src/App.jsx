// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import all page components
import First from './Pages/First';                    // Home / Dashboard
import CreateProducts from './Pages/CreateProducts';  // Add new product
import Cart from './Pages/Cart';                      // Billing cart
import CreateCustomer from './Pages/CreateCustomer';  // New customer
import Sales from './Pages/Sale';                     // New sale
import Allrproducts from './Pages/Allproducts';       // All products list
import ListofSales from './Pages/ListofSales';        // Sales report
import EditSale from './Pages/Editsales';             // Edit sale
import Notifications from './Pages/Notifications';    // Notifications

const App = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Routes>
        {/* Home / Dashboard */}
        <Route path="/" element={<First />} />

        {/* Product Management */}
        <Route path="/createProducts" element={<CreateProducts />} />
        <Route path="/allproducts" element={<Allrproducts />} />

        {/* Customer Management */}
        <Route path="/createCustomer" element={<CreateCustomer />} />

        {/* Billing & Sales */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/allsales" element={<ListofSales />} />
        <Route path="/editsales/:id" element={<EditSale />} />

        {/* Notifications */}
        <Route path="/notifications" element={<Notifications />} />

        {/* 404 - Catch-all for unknown paths */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center text-center px-6">
              <div>
                <h1 className="text-6xl md:text-9xl font-extrabold text-indigo-500 mb-6">404</h1>
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Page Not Found</h2>
                <p className="text-xl text-slate-400 mb-8">
                  The page you're looking for doesn't exist or has been moved.
                </p>
                <a
                  href="/"
                  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-xl text-lg transition transform hover:scale-105 shadow-lg"
                >
                  Return to Dashboard
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
