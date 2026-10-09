'use client';

import React, { createContext, useContext, useState, type ReactNode } from 'react';

export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  tier?: string;
  points?: number;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, initialData?: Partial<User>) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>({
    id: 'user_1',
    email: 'phannida@nida.com',
    firstName: 'พรรณนิดา',
    lastName: 'วิศณุ',
    phone: '081-892-3456',
    address: '108 สุขุมวิท ซอย 24 คลองเตย',
    city: 'กรุงเทพมหานคร',
    postalCode: '10110',
    tier: 'NIDA VIP GOLD',
    points: 1250,
  });

  const login = (email: string, initialData?: Partial<User>) => {
    setUser({
      id: `user_${Date.now()}`,
      email,
      firstName: initialData?.firstName || (email.includes('phannida') ? 'พรรณนิดา' : 'Nida'),
      lastName: initialData?.lastName || (email.includes('phannida') ? 'วิศณุ' : 'Customer'),
      phone: initialData?.phone || '081-234-5678',
      address: initialData?.address || '108 สุขุมวิท ซอย 24',
      city: initialData?.city || 'กรุงเทพมหานคร',
      postalCode: initialData?.postalCode || '10110',
      tier: 'NIDA VIP GOLD',
      points: 1250,
      ...initialData,
    });
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateProfile }}>
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
