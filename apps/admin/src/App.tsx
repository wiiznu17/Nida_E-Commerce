import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AdminProvider } from './context/AdminContext';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminProductCreate from './pages/AdminProductCreate';
import AdminProductEdit from './pages/AdminProductEdit';
import AdminOrders from './pages/AdminOrders';
import AdminInventory from './pages/AdminInventory';
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
  { path: '/inventory', element: <AdminInventory /> },
  { path: '/admin/inventory', element: <AdminInventory /> },
  { path: '/promotions', element: <AdminPromotions /> },
  { path: '/admin/promotions', element: <AdminPromotions /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);

function App() {
  return (
    <LanguageProvider>
      <AdminProvider>
        <RouterProvider router={router} />
      </AdminProvider>
    </LanguageProvider>
  );
}

export default App;
