'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { ApiUser } from '@repo/types';
import { authRequester } from '@/api';

export type User = ApiUser & {
  address?: string;
  city?: string;
  postalCode?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (token: string, user: ApiUser) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
};

const TOKEN_KEY = 'nida_customer_jwt_token';
const USER_CACHE_KEY = 'nida_customer_user_cache';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session from localStorage on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const cachedUser = localStorage.getItem(USER_CACHE_KEY);

        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch {
            // Ignore parse errors
          }
        }

        if (storedToken) {
          setToken(storedToken);
          const liveProfile = await authRequester.getProfile(storedToken);
          setUser((prev) => ({ ...prev, ...liveProfile }));
          localStorage.setItem(USER_CACHE_KEY, JSON.stringify(liveProfile));
        }
      } catch {
        // Token expired or invalid, reset
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_CACHE_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const setSession = (newToken: string, newUser: ApiUser) => {
    setToken(newToken);
    setUser(newUser);
    try {
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(newUser));
    } catch {
      // Ignore
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_CACHE_KEY);
    } catch {
      // Ignore
    }
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      try {
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        setSession,
        logout,
        updateProfile,
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
