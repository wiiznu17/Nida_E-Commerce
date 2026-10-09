'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { products as fallbackProducts, type Product } from '@/data/products';
import { fetchCatalogProducts, fetchProductByIdOrSlug } from '@/lib/catalogApi';

interface CatalogContextType {
  productsList: Product[];
  isLoading: boolean;
  refreshCatalog: () => Promise<void>;
  getProduct: (idOrSlug: string) => Product | undefined;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [productsList, setProductsList] = useState<Product[]>(fallbackProducts);
  const [isLoading, setIsLoading] = useState(false);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const liveProducts = await fetchCatalogProducts();
      if (liveProducts && liveProducts.length > 0) {
        setProductsList(liveProducts);
      }
    } catch (err) {
      console.warn('CatalogProvider: Using fallback products', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const getProduct = (idOrSlug: string): Product | undefined => {
    return productsList.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  };

  return (
    <CatalogContext.Provider
      value={{
        productsList,
        isLoading,
        refreshCatalog: loadProducts,
        getProduct,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
}
