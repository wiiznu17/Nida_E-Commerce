import { lazy } from 'react';
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
import { AdminPermission } from '@repo/types';

const lazyWithRetry = (factory: Parameters<typeof lazy>[0]) => {
  return lazy(async () => {
    const pageAlreadyRefreshed = JSON.parse(
      window.sessionStorage.getItem('page_refreshed_on_chunk_error') || 'false',
    );
    try {
      const module = await factory();
      window.sessionStorage.setItem('page_refreshed_on_chunk_error', 'false');
      return module;
    } catch (error: unknown) {
      if (!pageAlreadyRefreshed) {
        window.sessionStorage.setItem('page_refreshed_on_chunk_error', 'true');
        window.location.reload();
      }
      throw error;
    }
  });
};

// Public Auth Pages (Lazy-loaded)
const AdminLogin = lazyWithRetry(() =>
  import('./pages/AdminLogin').then((m) => ({ default: m.AdminLogin })),
);
const AdminSetupPassword = lazyWithRetry(() =>
  import('./pages/AdminSetupPassword').then((m) => ({
    default: m.AdminSetupPassword,
  })),
);
const AdminForgotPassword = lazyWithRetry(() =>
  import('./pages/AdminForgotPassword').then((m) => ({
    default: m.AdminForgotPassword,
  })),
);
const AdminResetPassword = lazyWithRetry(() =>
  import('./pages/AdminResetPassword').then((m) => ({
    default: m.AdminResetPassword,
  })),
);

// Protected Admin Pages (Lazy-loaded)
const AdminDashboard = lazyWithRetry(() => import('./pages/AdminDashboard'));
const AdminProducts = lazyWithRetry(() => import('./pages/AdminProducts'));
const AdminCategories = lazyWithRetry(() => import('./pages/AdminCategories'));
const AdminProductCreate = lazyWithRetry(
  () => import('./pages/AdminProductCreate'),
);
const AdminProductEdit = lazyWithRetry(
  () => import('./pages/AdminProductEdit'),
);
const AdminOrders = lazyWithRetry(() => import('./pages/AdminOrders'));
const AdminOrderDetail = lazyWithRetry(
  () => import('./pages/AdminOrderDetail'),
);
const AdminAnalytics = lazyWithRetry(() => import('./pages/AdminAnalytics'));
const AdminCancellations = lazyWithRetry(
  () => import('./pages/AdminCancellations'),
);
const AdminReturns = lazyWithRetry(() => import('./pages/AdminReturns'));
const AdminInventory = lazyWithRetry(() => import('./pages/AdminInventory'));
const AdminInventoryAudit = lazyWithRetry(
  () => import('./pages/AdminInventoryAudit'),
);
const AdminPromotions = lazyWithRetry(() => import('./pages/AdminPromotions'));
const AdminCmsContent = lazyWithRetry(() => import('./pages/AdminCmsContent'));
const AdminUsers = lazyWithRetry(() =>
  import('./pages/AdminUsers').then((m) => ({ default: m.AdminUsers })),
);
const AdminAuditLogs = lazyWithRetry(() => import('./pages/AdminAuditLogs'));
const AdminAccessDenied = lazyWithRetry(() =>
  import('./pages/AdminAccessDenied').then((m) => ({
    default: m.AdminAccessDenied,
  })),
);

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
          { path: '/analytics', element: <AdminAnalytics /> },
          { path: '/admin/analytics', element: <AdminAnalytics /> },
          { path: '/orders/:id', element: <AdminOrderDetail /> },
          { path: '/admin/orders/:id', element: <AdminOrderDetail /> },
          { path: '/cancellations', element: <AdminCancellations /> },
          { path: '/admin/cancellations', element: <AdminCancellations /> },
          { path: '/returns', element: <AdminReturns /> },
          { path: '/admin/returns', element: <AdminReturns /> },
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
