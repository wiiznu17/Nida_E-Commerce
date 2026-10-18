import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from './components/common/ProtectedRoute';

import { AdminLogin } from './pages/AdminLogin';
import { AdminSetupPassword } from './pages/AdminSetupPassword';
import { AdminForgotPassword } from './pages/AdminForgotPassword';
import { AdminResetPassword } from './pages/AdminResetPassword';

import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminCategories from './pages/AdminCategories';
import AdminProductCreate from './pages/AdminProductCreate';
import AdminProductEdit from './pages/AdminProductEdit';
import AdminOrders from './pages/AdminOrders';
import AdminOrderDetail from './pages/AdminOrderDetail';
import AdminInventory from './pages/AdminInventory';
import AdminInventoryAudit from './pages/AdminInventoryAudit';
import AdminPromotions from './pages/AdminPromotions';
import AdminCmsContent from './pages/AdminCmsContent';
import { AdminUsers } from './pages/AdminUsers';
import AdminAuditLogs from './pages/AdminAuditLogs';
import { AdminAccessDenied } from './pages/AdminAccessDenied';
import { AdminPermission } from '@repo/types';

const router = createBrowserRouter([
  // Public-only Auth Routes (If already logged in, redirect to /admin)
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <AdminLogin /> },
      { path: '/admin/login', element: <AdminLogin /> },
      { path: '/setup-password', element: <AdminSetupPassword /> },
      { path: '/admin/setup-password', element: <AdminSetupPassword /> },
      { path: '/forgot-password', element: <AdminForgotPassword /> },
      { path: '/admin/forgot-password', element: <AdminForgotPassword /> },
      { path: '/reset-password', element: <AdminResetPassword /> },
      { path: '/admin/reset-password', element: <AdminResetPassword /> },
    ],
  },

  // Protected Admin Routes (Require active authentication)
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/', element: <AdminDashboard /> },
      { path: '/admin', element: <AdminDashboard /> },
      { path: '/unauthorized', element: <AdminAccessDenied /> },
      { path: '/admin/unauthorized', element: <AdminAccessDenied /> },

      // Catalog Read
      {
        element: (
          <ProtectedRoute requiredPermissions={AdminPermission.CATALOG_READ} />
        ),
        children: [
          { path: '/products', element: <AdminProducts /> },
          { path: '/admin/products', element: <AdminProducts /> },
          { path: '/categories', element: <AdminCategories /> },
          { path: '/admin/categories', element: <AdminCategories /> },
        ],
      },

      // Catalog Write
      {
        element: (
          <ProtectedRoute requiredPermissions={AdminPermission.CATALOG_WRITE} />
        ),
        children: [
          { path: '/products/new', element: <AdminProductCreate /> },
          { path: '/admin/products/new', element: <AdminProductCreate /> },
          { path: '/products/:id/edit', element: <AdminProductEdit /> },
          { path: '/admin/products/:id/edit', element: <AdminProductEdit /> },
        ],
      },

      // Orders Read
      {
        element: (
          <ProtectedRoute requiredPermissions={AdminPermission.ORDERS_READ} />
        ),
        children: [
          { path: '/orders', element: <AdminOrders /> },
          { path: '/admin/orders', element: <AdminOrders /> },
          { path: '/orders/:id', element: <AdminOrderDetail /> },
          { path: '/admin/orders/:id', element: <AdminOrderDetail /> },
        ],
      },

      // Inventory Read
      {
        element: (
          <ProtectedRoute
            requiredPermissions={AdminPermission.INVENTORY_READ}
          />
        ),
        children: [
          { path: '/inventory', element: <AdminInventory /> },
          { path: '/admin/inventory', element: <AdminInventory /> },
          { path: '/inventory/audit', element: <AdminInventoryAudit /> },
          { path: '/admin/inventory/audit', element: <AdminInventoryAudit /> },
        ],
      },

      // Promotions / Coupons Read
      {
        element: (
          <ProtectedRoute requiredPermissions={AdminPermission.COUPONS_READ} />
        ),
        children: [
          { path: '/promotions', element: <AdminPromotions /> },
          { path: '/admin/promotions', element: <AdminPromotions /> },
          { path: '/content', element: <AdminCmsContent /> },
          { path: '/admin/content', element: <AdminCmsContent /> },
        ],
      },

      // Staff Management
      {
        element: (
          <ProtectedRoute
            requiredPermissions={AdminPermission.ADMIN_USERS_MANAGE}
          />
        ),
        children: [
          { path: '/users', element: <AdminUsers /> },
          { path: '/admin/users', element: <AdminUsers /> },
        ],
      },

      // Audit Logs
      {
        element: (
          <ProtectedRoute
            requiredPermissions={AdminPermission.AUDIT_LOGS_READ}
          />
        ),
        children: [
          { path: '/audit-logs', element: <AdminAuditLogs /> },
          { path: '/admin/audit-logs', element: <AdminAuditLogs /> },
        ],
      },
    ],
  },

  // Catch-all
  { path: '*', element: <Navigate to="/admin" replace /> },
]);

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
