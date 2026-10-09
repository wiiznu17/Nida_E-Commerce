'use client';

import React, { type ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { CatalogProvider } from '@/context/CatalogContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <CatalogProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>{children}</CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </CatalogProvider>
    </LanguageProvider>
  );
}
