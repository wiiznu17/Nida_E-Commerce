'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { StorefrontProduct, ApiCoupon, DiscountType } from '@repo/types';
import { couponRequester } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export type CartItem = StorefrontProduct & {
  variantId: string;
  sku: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  maxStock: number;
};

export type CartContextType = {
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
  // Coupon & Shipping Engine
  appliedCoupon: ApiCoupon | null;
  couponCode: string;
  discountAmount: number;
  shippingFee: number;
  freeShippingThreshold: number;
  standardShippingFee: number;
  isFreeShipping: boolean;
  freeShippingProgress: number;
  freeShippingRemaining: number;
  finalTotal: number;
  couponError: string | null;
  isApplyingCoupon: boolean;
  applyCoupon: (code: string) => Promise<{ success: boolean; message?: string }>;
  removeCoupon: () => void;
};

export function getCouponErrorMessage(
  reason: string,
  t: (key: string, fallback?: string) => string,
): string {
  switch (reason) {
    case 'NOT_FOUND':
      return t('checkout.couponReasonNotFound', 'ไม่พบโค้ดส่วนลดนี้ในระบบ');
    case 'EXPIRED':
      return t('checkout.couponReasonExpired', 'โค้ดส่วนลดนี้หมดอายุการใช้งานแล้ว');
    case 'NOT_YET_ACTIVE':
      return t('checkout.couponReasonNotYetActive', 'โค้ดส่วนลดยังไม่เริ่มเปิดให้ใช้งาน');
    case 'USAGE_LIMIT_REACHED':
      return t('checkout.couponReasonUsageLimitReached', 'สิทธิ์การใช้งานของโค้ดนี้เต็มแล้ว');
    case 'USER_LIMIT_REACHED':
      return t('checkout.couponReasonUserLimitReached', 'คุณใช้สิทธิ์ของโค้ดนี้ครบกำหนดแล้ว');
    case 'MIN_ORDER_NOT_MET':
      return t('checkout.couponReasonMinOrderNotMet', 'ยอดสั่งซื้อไม่ถึงเกณฑ์ขั้นต่ำสำหรับโค้ดนี้');
    case 'TIER_NOT_ELIGIBLE':
      return t('checkout.couponReasonTierNotEligible', 'สิทธิ์การใช้งานเฉพาะระดับสมาชิกที่กำหนด');
    case 'INACTIVE':
      return t('checkout.couponReasonInactive', 'โค้ดส่วนลดนี้ถูกปิดใช้งานชั่วคราว');
    default:
      return t('checkout.couponReasonUnknown', 'ไม่สามารถใช้งานโค้ดส่วนลดนี้ได้');
  }
}

const CART_STORAGE_KEY = 'nida_store_cart_v1';
const COUPON_STORAGE_KEY = 'nida_store_coupon_v1';
const FREE_SHIPPING_THRESHOLD = 1000;
const STANDARD_SHIPPING_FEE = 50;

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<ApiCoupon | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Restore cart and coupon from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }

      const storedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (storedCoupon) {
        const parsedCoupon = JSON.parse(storedCoupon);
        if (parsedCoupon?.code) {
          setAppliedCoupon(parsedCoupon);
          setCouponCode(parsedCoupon.code);
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

  // Save coupon to localStorage whenever coupon changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (appliedCoupon) {
        localStorage.setItem(
          COUPON_STORAGE_KEY,
          JSON.stringify(appliedCoupon),
        );
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch {
      // Ignore quota errors
    }
  }, [appliedCoupon, isHydrated]);

  const cartTotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const totalQuantity = items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  // Auto-validate active coupon against minimum order amount whenever cart changes
  useEffect(() => {
    if (!appliedCoupon || !isHydrated) return;

    if (items.length === 0) {
      setAppliedCoupon(null);
      setCouponCode('');
      setCouponError(null);
      return;
    }

    if (cartTotal < appliedCoupon.minOrderAmount) {
      const msg = getCouponErrorMessage('MIN_ORDER_NOT_MET', t);
      setCouponError(msg);
      setAppliedCoupon(null);
      setCouponCode('');
    }
  }, [cartTotal, items.length, appliedCoupon, isHydrated, t]);

  // Compute discount amount based on coupon type
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      const rawDiscount = (cartTotal * appliedCoupon.discountValue) / 100;
      discountAmount = appliedCoupon.maxDiscountAmount
        ? Math.min(rawDiscount, appliedCoupon.maxDiscountAmount)
        : rawDiscount;
    } else if (appliedCoupon.discountType === 'FIXED_AMOUNT') {
      discountAmount = Math.min(cartTotal, appliedCoupon.discountValue);
    } else if (appliedCoupon.discountType === 'FREE_SHIPPING') {
      discountAmount = 0;
    }
    discountAmount = Math.round(discountAmount * 100) / 100;
  }

  // Shipping policy calculations
  const isFreeShipping =
    items.length > 0 &&
    (cartTotal >= FREE_SHIPPING_THRESHOLD ||
      appliedCoupon?.discountType === 'FREE_SHIPPING');

  const shippingFee =
    items.length === 0 ? 0 : isFreeShipping ? 0 : STANDARD_SHIPPING_FEE;

  const freeShippingProgress = Math.min(
    100,
    Math.round((cartTotal / FREE_SHIPPING_THRESHOLD) * 100),
  );

  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);

  const finalTotal = Math.max(
    0,
    Math.round((cartTotal - discountAmount + shippingFee) * 100) / 100,
  );

  const applyCoupon = async (
    rawCode: string,
  ): Promise<{ success: boolean; message?: string }> => {
    const code = rawCode.trim().toUpperCase();
    if (!code) {
      const msg = getCouponErrorMessage('NOT_FOUND', t);
      setCouponError(msg);
      return { success: false, message: msg };
    }

    if (cartTotal <= 0) {
      const msg = getCouponErrorMessage('MIN_ORDER_NOT_MET', t);
      setCouponError(msg);
      return { success: false, message: msg };
    }

    setIsApplyingCoupon(true);
    setCouponError(null);

    try {
      const res = await couponRequester.validate(code, cartTotal, user?.id);
      if (res.valid && res.coupon) {
        setAppliedCoupon(res.coupon);
        setCouponCode(res.coupon.code);
        setCouponError(null);
        return { success: true };
      } else {
        const msg = getCouponErrorMessage(res.reason || 'UNKNOWN', t);
        setCouponError(msg);
        return { success: false, message: msg };
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : getCouponErrorMessage('UNKNOWN', t);
      setCouponError(msg);
      return { success: false, message: msg };
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
    try {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

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
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

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
        appliedCoupon,
        couponCode,
        discountAmount,
        shippingFee,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        standardShippingFee: STANDARD_SHIPPING_FEE,
        isFreeShipping,
        freeShippingProgress,
        freeShippingRemaining,
        finalTotal,
        couponError,
        isApplyingCoupon,
        applyCoupon,
        removeCoupon,
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
