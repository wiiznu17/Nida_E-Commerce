import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminProductCreate from './pages/AdminProductCreate';
import AdminProductEdit from './pages/AdminProductEdit';
import AdminOrders from './pages/AdminOrders';
import AdminOrderDetail from './pages/AdminOrderDetail';
import AdminInventory from './pages/AdminInventory';
import AdminInventoryAudit from './pages/AdminInventoryAudit';
import AdminPromotions from './pages/AdminPromotions';

const router = createBrowserRouter([
  { path: '/', element: <AdminDashboard /> },
  { path: '/admin', element: <AdminDashboard /> },
  { path: '/products', element: <AdminProducts /> },
  { path: '/admin/products', element: <AdminProducts /> },
  { path: '/products/new', element: <AdminProductCreate /> },
  { path: '/admin/products/new', element: <AdminProductCreate /> },
  { path: '/products/:id/edit', element: <AdminProductEdit /> },
  { path: '/admin/products/:id/edit', element: <AdminProductEdit /> },
  { path: '/orders', element: <AdminOrders /> },
  { path: '/admin/orders', element: <AdminOrders /> },
  { path: '/orders/:id', element: <AdminOrderDetail /> },
  { path: '/admin/orders/:id', element: <AdminOrderDetail /> },
  { path: '/inventory', element: <AdminInventory /> },
  { path: '/admin/inventory', element: <AdminInventory /> },
  { path: '/inventory/audit', element: <AdminInventoryAudit /> },
  { path: '/admin/inventory/audit', element: <AdminInventoryAudit /> },
  { path: '/promotions', element: <AdminPromotions /> },
  { path: '/admin/promotions', element: <AdminPromotions /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);

function App() {
  return (
    <LanguageProvider>
      <RouterProvider router={router} />
    </LanguageProvider>
  );
}

export default App;
