'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { ApiUser } from '@repo/types';
import type { UpdateCustomerProfileInput } from '@repo/validators';
import { authRequester } from '@/api';

export type User = ApiUser & {
  address?: string;
  city?: string;
  postalCode?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (
    accessToken: string,
    userOrRefreshToken: ApiUser | string,
    maybeUser?: ApiUser,
  ) => void;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  updateProfile: (data: UpdateCustomerProfileInput) => Promise<ApiUser | null>;
  isAuthDrawerOpen: boolean;
  authDrawerTab: 'signin' | 'signup';
  openAuthDrawer: (tab?: 'signin' | 'signup') => void;
  closeAuthDrawer: () => void;
};

const ACCESS_TOKEN_KEY = 'nida_customer_jwt_token';
const REFRESH_TOKEN_KEY = 'nida_customer_refresh_token';
const USER_CACHE_KEY = 'nida_customer_user_cache';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
  const [authDrawerTab, setAuthDrawerTab] = useState<'signin' | 'signup'>(
    'signin',
  );

  const openAuthDrawer = useCallback(
    (tab: 'signin' | 'signup' = 'signin') => {
      // Guard: do not open auth drawer if user is already authenticated
      if (token && user) {
        return;
      }
      setAuthDrawerTab(tab);
      setIsAuthDrawerOpen(true);
    },
    [token, user],
  );

  const closeAuthDrawer = useCallback(() => {
    setIsAuthDrawerOpen(false);
  }, []);

  // Guard: auto-close auth drawer if user becomes authenticated
  useEffect(() => {
    if (token && user && isAuthDrawerOpen) {
      setIsAuthDrawerOpen(false);
    }
  }, [token, user, isAuthDrawerOpen]);

  const clearSession = useCallback(() => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_CACHE_KEY);
    } catch {
      // Storage unavailable
    }
  }, []);

  // Restore authenticated session from localStorage on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const cachedUser = localStorage.getItem(USER_CACHE_KEY);

        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch {
            // Ignore parse errors
          }
        }

        if (storedAccessToken) {
          setToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          const liveProfile = await authRequester.getProfile(storedAccessToken);
          setUser((prev) => ({ ...prev, ...liveProfile }));
          localStorage.setItem(USER_CACHE_KEY, JSON.stringify(liveProfile));
        }
      } catch {
        // Token expired or invalid, reset
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [clearSession]);

  // Listen to session expired event from apiClient
  useEffect(() => {
    const handleSessionExpired = () => {
      clearSession();
    };

    window.addEventListener('nida:auth:session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener(
        'nida:auth:session_expired',
        handleSessionExpired,
      );
    };
  }, [clearSession]);

  // Listen to token rotated event from apiClient to keep AuthContext state always fresh
  useEffect(() => {
    const handleTokenRotated = (e: Event) => {
      const customEvent = e as CustomEvent<{
        accessToken: string;
        refreshToken?: string;
      }>;
      if (customEvent.detail?.accessToken) {
        setToken(customEvent.detail.accessToken);
        if (customEvent.detail.refreshToken) {
          setRefreshToken(customEvent.detail.refreshToken);
        }
      }
    };

    window.addEventListener('nida:auth:token_rotated', handleTokenRotated);
    return () => {
      window.removeEventListener('nida:auth:token_rotated', handleTokenRotated);
    };
  }, []);

  const setSession = (
    accessToken: string,
    userOrRefreshToken: ApiUser | string,
    maybeUser?: ApiUser,
  ) => {
    let nextRefreshToken: string | null = null;
    let nextUser: ApiUser;

    if (typeof userOrRefreshToken === 'string') {
      nextRefreshToken = userOrRefreshToken;
      nextUser = maybeUser as ApiUser;
    } else {
      nextUser = userOrRefreshToken;
    }

    setToken(accessToken);
    setRefreshToken(nextRefreshToken);
    setUser(nextUser);

    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      if (nextRefreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, nextRefreshToken);
      }
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(nextUser));
    } catch {
      // Ignore storage errors
    }

    closeAuthDrawer();
  };

  const logout = async () => {
    try {
      const activeRefresh =
        refreshToken ?? localStorage.getItem(REFRESH_TOKEN_KEY);
      await authRequester.logout(activeRefresh);
    } catch {
      // Best effort logout
    } finally {
      clearSession();
    }
  };

  const logoutAll = async () => {
    try {
      const activeToken = token ?? localStorage.getItem(ACCESS_TOKEN_KEY);
      await authRequester.logoutAll(activeToken);
    } catch {
      // Best effort
    } finally {
      clearSession();
    }
  };

  const updateProfile = async (
    data: UpdateCustomerProfileInput,
  ): Promise<ApiUser | null> => {
    if (!token) return null;
    try {
      const updated = await authRequester.updateProfile(token, data);
      setUser((prev) => (prev ? { ...prev, ...updated } : updated));
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(updated));
      return updated;
    } catch (err: unknown) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        isAuthenticated: Boolean(user && token),
        isLoading,
        setSession,
        logout,
        logoutAll,
        updateProfile,
        isAuthDrawerOpen,
        authDrawerTab,
        openAuthDrawer,
        closeAuthDrawer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
