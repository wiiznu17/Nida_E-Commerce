import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminPermission } from '@repo/types';

export interface PermissionGateProps {
  permission?: AdminPermission | string;
  permissions?: (AdminPermission | string)[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  permissions,
  requireAll = true,
  fallback = null,
  children,
}) => {
  const { hasPermission } = useAuth();

  const requiredList: string[] = [];
  if (permission) {
    requiredList.push(permission);
  }
  if (permissions && permissions.length > 0) {
    requiredList.push(...permissions);
  }

  if (requiredList.length === 0) {
    return <>{children}</>;
  }

  const isAuthorized = requireAll
    ? requiredList.every((perm) => hasPermission(perm))
    : requiredList.some((perm) => hasPermission(perm));

  if (!isAuthorized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
