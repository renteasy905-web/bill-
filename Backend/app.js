import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Your existing imports
import First from './Pages/First';
import Allproducts from './Pages/Allproducts';
import CreateProducts from './Pages/CreateProducts';
import Cart from './Pages/Cart';
import CreateCustomer from './Pages/CreateCustomer';
import Sales from './Pages/Sales';
import ListofSales from './Pages/ListofSales';
import Editsales from './Pages/Editsales';

// ADD THIS IMPORT
import Notifications from './Pages/Notifications';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<First />} />
        <Route path="/allproducts" element={<Allproducts />} />
        <Route path="/createProducts" element={<CreateProducts />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/createCustomer" element={<CreateCustomer />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/allsales" element={<ListofSales />} />
        <Route path="/editsales/:id" element={<Editsales />} />

        {/* ADD THIS NEW ROUTE */}
        <Route path="/notifications" element={<Notifications />} />

        {/* Optional - catch all 404 */}
        <Route path="*" element={<div className="pt-20 text-white text-center text-3xl p-8">404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
