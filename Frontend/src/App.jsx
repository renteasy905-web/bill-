// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import First from './Pages/First';
import CreateProducts from './Pages/CreateProducts';
import Cart from './Pages/Cart';                          // ← Make sure this import exists
import CreateCustomer from './Pages/CreateCustomer';
import Sales from './Pages/Sale';
import Allrproducts from './Pages/Allproducts';
import ListofSales from './Pages/ListofSales';
import EditSale from './Pages/Editsales';
import Notifications from './Pages/Notifications';

const App = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Routes>
        <Route path="/" element={<First />} />
        <Route path="/createProducts" element={<CreateProducts />} />
        <Route path="/allproducts" element={<Allrproducts />} />
        <Route path="/createCustomer" element={<CreateCustomer />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/allsales" element={<ListofSales />} />
        <Route path="/editsales/:id" element={<EditSale />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* ←←← THIS WAS MISSING – ADD THIS */}
        <Route path="/cart" element={<Cart />} />

        {/* 404 fallback */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center text-center px-6">
              <div>
                <h1 className="text-6xl md:text-9xl font-extrabold text-indigo-500 mb-6">404</h1>
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Page Not Found</h2>
                <a href="/" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-xl text-lg">
                  Back to Home
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
