import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Cart from './Pages/Cart';
import CreateCustomer from './Pages/CreateCustomer';
import Sales from './Pages/Sale';
import CreateProducts from './Pages/CreateProducts';
import Allrproducts from './Pages/Allproducts';
import ListofSales from './Pages/ListofSales';
import First from './Pages/First';
import EditSale from './Pages/Editsales';

// ADD THIS IMPORT FOR NOTIFICATIONS
import Notifications from './Pages/Notifications';  // Make sure the path matches your file location

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<First />} />
        <Route path='/createProducts' element={<CreateProducts />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/createCustomer' element={<CreateCustomer />} />
        <Route path='/sales' element={<Sales />} />
        <Route path='/allproducts' element={<Allrproducts />} />
        <Route path='/allsales' element={<ListofSales />} />
        <Route path='/editsales/:id' element={<EditSale />} />

        {/* ADD THIS NEW ROUTE */}
        <Route path='/notifications' element={<Notifications />} />

        {/* Optional: Catch-all for unknown paths */}
        <Route path="*" element={
          <div className="pt-20 text-center text-white text-3xl p-8">
            404 - Page Not Found
          </div>
        } />
      </Routes>
    </div>
  );
};

export default App;
