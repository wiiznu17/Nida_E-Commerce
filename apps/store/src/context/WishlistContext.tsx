'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { useCatalog } from './CatalogContext';
import { wishlistRequester } from '@/api';

const WISHLIST_STORAGE_KEY = 'nida_wishlist';

type WishlistContextType = {
  wishlist: string[]; // Product IDs
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
  clearWishlist: () => void;
  isLoading: boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user, token, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { productsList, isLoading: isCatalogLoading } = useCatalog();
  const router = useRouter();
  const pathname = usePathname();

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Clean up legacy localStorage on mount to prevent stale guest keys
  useEffect(() => {
    try {
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Fetch customer wishlist from database whenever authenticated session changes
  const refreshWishlist = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setWishlist([]);
      return;
    }

    setIsLoading(true);
    try {
      const productIds = await wishlistRequester.getWishlist(token);
      setWishlist(productIds);
    } catch (err) {
      console.error('Failed to fetch wishlist from database:', err);
      setWishlist([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    if (!isAuthLoading) {
      void refreshWishlist();
    }
  }, [isAuthLoading, refreshWishlist]);

  // Compute set of valid product IDs in active catalog
  const catalogProductIds = useMemo(() => {
    return new Set(productsList.map((p) => p.id).filter(Boolean));
  }, [productsList]);

  const toggleWishlist = async (productId: string) => {
    if (!productId) return;

    // Guard: Require login first
    if (!isAuthenticated || !token || !user) {
      const targetUrl = pathname
        ? `/login?redirect=${encodeURIComponent(pathname)}`
        : '/login';
      router.push(targetUrl);
      return;
    }

    const isAlreadyIn = wishlist.includes(productId);
    const rollbackState = [...wishlist];

    // Optimistic UI update
    setWishlist((prev) =>
      isAlreadyIn
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );

    try {
      if (isAlreadyIn) {
        await wishlistRequester.removeFromWishlist(productId, token);
      } else {
        await wishlistRequester.addToWishlist(productId, token);
      }
    } catch (err) {
      console.error('Failed to sync wishlist change to database:', err);
      // Rollback on server error
      setWishlist(rollbackState);
    }
  };

  const isInWishlist = (productId: string) => {
    if (!isAuthenticated || !productId) return false;
    return wishlist.includes(productId);
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  // Only count items for authenticated users that exist in catalog once catalog is loaded
  const validWishlistCount = useMemo(() => {
    if (!isAuthenticated) return 0;
    if (isCatalogLoading || productsList.length === 0) {
      return wishlist.length;
    }
    return wishlist.filter((id) => catalogProductIds.has(id)).length;
  }, [
    isAuthenticated,
    isCatalogLoading,
    productsList.length,
    wishlist,
    catalogProductIds,
  ]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount: validWishlistCount,
        clearWishlist,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
