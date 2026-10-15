'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { StorefrontProduct } from '@repo/types';

export type CartItem = StorefrontProduct & {
  variantId: string;
  sku: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  maxStock: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (
    product: StorefrontProduct,
    size?: string,
    color?: string,
    variantId?: string,
  ) => void;
  removeFromCart: (identifier: string) => void;
  updateQuantity: (identifier: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cartTotal: number;
  totalQuantity: number;
};

const CART_STORAGE_KEY = 'nida_store_cart_v1';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // Ignore parse errors on first load
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore quota errors
    }
  }, [items, isHydrated]);

  const addToCart = (
    product: StorefrontProduct,
    size?: string,
    color?: string,
    explicitVariantId?: string,
  ) => {
    const chosenSize = size || 'M';
    const chosenColor = color || (product.colors?.[0] ?? 'Classic');

    // Resolve variant matching chosen size & color
    const matchedVariant = product.variants?.find((v) => {
      const matchSize =
        !chosenSize || v.size.toLowerCase() === chosenSize.toLowerCase();
      const matchColor =
        !chosenColor ||
        v.colorName.toLowerCase() === chosenColor.toLowerCase() ||
        v.colorHex.toLowerCase() === chosenColor.toLowerCase();
      return matchSize && matchColor;
    }) ?? product.variants?.[0];

    const variantId = explicitVariantId || matchedVariant?.id || product.id;
    const sku = matchedVariant?.sku || product.slug || variantId;
    const maxStock = matchedVariant?.quantityAvailable ?? 99;

    setItems((prev) => {
      const existing = prev.find(
        (item) =>
          item.variantId === variantId ||
          (item.id === product.id &&
            item.selectedSize === chosenSize &&
            item.selectedColor === chosenColor),
      );

      if (existing) {
        const newQty = Math.min(existing.quantity + 1, existing.maxStock || 99);
        return prev.map((item) =>
          item === existing ? { ...item, quantity: newQty } : item,
        );
      }

      return [
        ...prev,
        {
          ...product,
          variantId,
          sku,
          quantity: 1,
          selectedSize: chosenSize,
          selectedColor: chosenColor,
          maxStock,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (identifier: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => item.variantId !== identifier && item.id !== identifier,
      ),
    );
  };

  const updateQuantity = (identifier: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(identifier);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.variantId === identifier || item.id === identifier) {
          const validQty = Math.min(quantity, item.maxStock || 99);
          return { ...item, quantity: validQty };
        }
        return item;
      }),
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const cartTotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const totalQuantity = items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartTotal,
        totalQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
