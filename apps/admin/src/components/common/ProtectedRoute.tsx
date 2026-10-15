import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminAccessDenied } from '../../pages/AdminAccessDenied';
import type { AdminPermission } from '@repo/types';

export interface ProtectedRouteProps {
  requiredPermissions?: (AdminPermission | string)[] | AdminPermission | string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredPermissions,
}) => {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-2 border-[#2B1810]/20 border-t-[#2B1810] rounded-full animate-spin" />
          <span className="text-[11px] font-black tracking-widest text-[#2B1810]/60 uppercase">
            Verifying Nida Security Session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/admin/login?redirect=${redirectUrl}`} replace />;
  }

  if (requiredPermissions) {
    const permissionsToCheck = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    const hasAll = permissionsToCheck.every((perm) => hasPermission(perm));
    if (!hasAll) {
      return (
        <AdminAccessDenied requiredPermission={permissionsToCheck.join(', ')} />
      );
    }
  }

  return <Outlet />;
};

export const PublicOnlyRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2B1810]/20 border-t-[#2B1810] rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};
