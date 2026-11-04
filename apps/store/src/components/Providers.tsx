'use client';

import React, { type ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { LanguageProvider, type Language } from '@/context/LanguageContext';
import { CatalogProvider } from '@/context/CatalogContext';
import { StoreContentProvider } from '@/context/StoreContentContext';

export function Providers({
  children,
  initialLanguage = 'th',
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <StoreContentProvider>
        <CatalogProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>{children}</CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </CatalogProvider>
      </StoreContentProvider>
    </LanguageProvider>
  );
}
