import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { authRequester } from '../api/requester/authRequester';
import type { ApiAdminUser, AdminRoleCode } from '@repo/types';

interface AuthContextType {
  admin: ApiAdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<ApiAdminUser>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasRole: (role: AdminRoleCode | string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<ApiAdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('nida_auth_token');
      if (!token) {
        setAdmin(null);
        return;
      }
      const profile = await authRequester.getMe();
      setAdmin(profile);
    } catch {
      localStorage.removeItem('nida_auth_token');
      localStorage.removeItem('nida_refresh_token');
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();

    const handleAuthExpired = () => {
      setAdmin(null);
      setIsLoading(false);
      window.location.href = '/admin/login';
    };

    window.addEventListener('nida_auth_expired', handleAuthExpired);
    return () => {
      window.removeEventListener('nida_auth_expired', handleAuthExpired);
    };
  }, [fetchProfile]);

  const login = useCallback(
    async (identifier: string, password: string): Promise<ApiAdminUser> => {
      const response = await authRequester.login({ identifier, password });
      localStorage.setItem('nida_auth_token', response.accessToken);
      localStorage.setItem('nida_refresh_token', response.refreshToken);
      setAdmin(response.admin);
      return response.admin;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('nida_refresh_token') ?? undefined;
      await authRequester.logout(refreshToken);
    } catch {
      // Continue cleanup on client
    } finally {
      localStorage.removeItem('nida_auth_token');
      localStorage.removeItem('nida_refresh_token');
      setAdmin(null);
    }
  }, []);

  const logoutAll = useCallback(async () => {
    try {
      await authRequester.logoutAll();
    } catch {
      // Continue cleanup on client
    } finally {
      localStorage.removeItem('nida_auth_token');
      localStorage.removeItem('nida_refresh_token');
      setAdmin(null);
    }
  }, []);

  const hasRole = useCallback(
    (role: AdminRoleCode | string): boolean => {
      if (!admin) return false;
      if (admin.role.roleCode === 'SUPER_ADMIN') return true;
      return admin.role.roleCode === role;
    },
    [admin],
  );

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!admin) return false;
      if (admin.role.roleCode === 'SUPER_ADMIN') return true;
      return admin.role.permissions?.includes(permission) ?? false;
    },
    [admin],
  );

  const value = useMemo(
    () => ({
      admin,
      isAuthenticated: Boolean(admin),
      isLoading,
      login,
      logout,
      logoutAll,
      refreshProfile: fetchProfile,
      hasRole,
      hasPermission,
    }),
    [admin, isLoading, login, logout, logoutAll, fetchProfile, hasRole, hasPermission],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
