'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type { ApiCategory, StorefrontProduct } from '@repo/types';
import { fetchCatalogProducts, fetchCatalogCategories } from '@/lib/catalogApi';

interface CatalogContextType {
  productsList: StorefrontProduct[];
  categories: ApiCategory[];
  parentCategories: ApiCategory[];
  categoriesByDept: Record<string, ApiCategory[]>;
  isLoading: boolean;
  isLoadingCategories: boolean;
  refreshCatalog: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  getProduct: (idOrSlug: string) => StorefrontProduct | undefined;
  getCategoryBySlug: (slug: string) => ApiCategory | undefined;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [productsList, setProductsList] = useState<StorefrontProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const liveProducts = await fetchCatalogProducts();
      setProductsList(liveProducts);
    } catch (err) {
      console.warn('CatalogProvider: Failed to load products', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const liveCats = await fetchCatalogCategories();
      if (liveCats && liveCats.length > 0) {
        setCategories(liveCats);
      }
    } catch (err) {
      console.warn('CatalogProvider: Failed to load categories', err);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Filter top-level parent categories
  const parentCategories = useMemo(() => {
    return categories.filter((c) => !c.parentId);
  }, [categories]);

  // Group parent categories by department (lowercase key)
  const categoriesByDept = useMemo(() => {
    const map: Record<string, ApiCategory[]> = {
      women: [],
      men: [],
      kids: [],
      bags: [],
      shoes: [],
      home: [],
    };

    for (const cat of parentCategories) {
      const deptKey = cat.department.toLowerCase();
      if (!map[deptKey]) {
        map[deptKey] = [];
      }
      map[deptKey].push(cat);
    }

    return map;
  }, [parentCategories]);

  const getProduct = (idOrSlug: string): StorefrontProduct | undefined => {
    return productsList.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  };

  const getCategoryBySlug = (slug: string): ApiCategory | undefined => {
    const normalized = slug.toLowerCase();
    for (const c of categories) {
      if (c.slug.toLowerCase() === normalized) return c;
      if (c.children) {
        for (const child of c.children) {
          if (child.slug.toLowerCase() === normalized) return child;
        }
      }
    }
    return undefined;
  };

  return (
    <CatalogContext.Provider
      value={{
        productsList,
        categories,
        parentCategories,
        categoriesByDept,
        isLoading,
        isLoadingCategories,
        refreshCatalog: loadProducts,
        refreshCategories: loadCategories,
        getProduct,
        getCategoryBySlug,
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
