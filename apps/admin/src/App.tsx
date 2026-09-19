import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AdminProvider } from './context/AdminContext';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminInventory from './pages/AdminInventory';
import AdminPromotions from './pages/AdminPromotions';

function App() {
  return (
    <LanguageProvider>
      <AdminProvider>
        <BrowserRouter>
          <Routes>
            {/* Dashboard routes */}
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Products routes */}
            <Route path="/products" element={<AdminProducts />} />
            <Route path="/admin/products" element={<AdminProducts />} />

            {/* Orders routes */}
            <Route path="/orders" element={<AdminOrders />} />
            <Route path="/admin/orders" element={<AdminOrders />} />

            {/* Inventory routes */}
            <Route path="/inventory" element={<AdminInventory />} />
            <Route path="/admin/inventory" element={<AdminInventory />} />

            {/* Promotions routes */}
            <Route path="/promotions" element={<AdminPromotions />} />
            <Route path="/admin/promotions" element={<AdminPromotions />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </LanguageProvider>
  );
}

export default App;
