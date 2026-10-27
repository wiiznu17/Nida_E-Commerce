'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type {
  ApiProduct,
  ApiProductDetail,
  ApiCoupon,
  DiscountType,
} from '@repo/types';
import { couponRequester, catalogRequester, cartRequester } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { isOneSizeProduct, getProductSizes } from '@/utils';

export interface CartItem {
  id: string;
  productId: string;
  slug: string;
  name: string;
  nameTh?: string;
  price: number;
  basePrice?: number;
  originalPrice?: number;
  image: string;
  primaryImage?: string;
  department?: string;
  categorySlug?: string;
  categoryName?: string;
  categoryNameTh?: string;
  variantId: string;
  sku: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  maxStock: number;
  isPreorder?: boolean;
  isActive?: boolean;
  isAvailable?: boolean;
}

export type CartContextType = {
  items: CartItem[];
  addToCart: (
    product: ApiProduct | ApiProductDetail,
    size?: string,
    color?: string,
    variantId?: string,
  ) => void;
  removeFromCart: (identifier: string) => void;
  updateQuantity: (identifier: string, quantity: number) => void;
  updateItemPrices: (
    updates: Array<{ variantId: string; newPrice: number }>,
  ) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cartTotal: number;
  totalQuantity: number;
  // Availability Helpers
  hasUnavailableItems: boolean;
  unavailableItemsCount: number;
  removeUnavailableItems: () => void;
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
  clearCouponError: () => void;
  isApplyingCoupon: boolean;
  applyCoupon: (
    code: string,
  ) => Promise<{ success: boolean; message?: string }>;
  removeCoupon: () => void;
  // Cart Server Auto-Sync
  isSyncingCart: boolean;
  cartSyncNotice: string | null;
  clearCartSyncNotice: () => void;
  syncCart: () => Promise<void>;
};

export function getCouponErrorMessage(
  reason: string,
  t: (key: string, fallback?: string) => string,
): string {
  switch (reason) {
    case 'NOT_FOUND':
      return t('checkout.couponReasonNotFound', 'ไม่พบโค้ดส่วนลดนี้ในระบบ');
    case 'EXPIRED':
      return t(
        'checkout.couponReasonExpired',
        'โค้ดส่วนลดนี้หมดอายุการใช้งานแล้ว',
      );
    case 'NOT_YET_ACTIVE':
      return t(
        'checkout.couponReasonNotYetActive',
        'โค้ดส่วนลดยังไม่เริ่มเปิดให้ใช้งาน',
      );
    case 'USAGE_LIMIT_REACHED':
      return t(
        'checkout.couponReasonUsageLimitReached',
        'สิทธิ์การใช้งานของโค้ดนี้เต็มแล้ว',
      );
    case 'USER_LIMIT_REACHED':
      return t(
        'checkout.couponReasonUserLimitReached',
        'คุณใช้สิทธิ์ของโค้ดนี้ครบกำหนดแล้ว',
      );
    case 'MIN_ORDER_NOT_MET':
      return t(
        'checkout.couponReasonMinOrderNotMet',
        'ยอดสั่งซื้อไม่ถึงเกณฑ์ขั้นต่ำสำหรับโค้ดนี้',
      );
    case 'TIER_NOT_ELIGIBLE':
      return t(
        'checkout.couponReasonTierNotEligible',
        'สิทธิ์การใช้งานเฉพาะระดับสมาชิกที่กำหนด',
      );
    case 'INACTIVE':
      return t(
        'checkout.couponReasonInactive',
        'โค้ดส่วนลดนี้ถูกปิดใช้งานชั่วคราว',
      );
    case 'ACCOUNT_REQUIRED':
      return t(
        'checkout.couponReasonAccountRequired',
        'คูปองส่วนลดสงวนสิทธิ์เฉพาะสมาชิก กรุณาเข้าสู่ระบบก่อนใช้งาน',
      );
    case 'ALREADY_FREE_SHIPPING':
      return t(
        'checkout.couponReasonAlreadyFreeShipping',
        'คำสั่งซื้อของคุณได้รับสิทธิ์จัดส่งฟรีอยู่แล้ว ไม่จำเป็นต้องใช้โค้ดนี้',
      );
    default:
      return t(
        'checkout.couponReasonUnknown',
        'ไม่สามารถใช้งานโค้ดส่วนลดนี้ได้',
      );
  }
}

const CART_STORAGE_KEY = 'nida_store_cart_v1';
const COUPON_STORAGE_KEY = 'nida_store_coupon_v1';
const FREE_SHIPPING_THRESHOLD = 1000;
const STANDARD_SHIPPING_FEE = 50;

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, token, isLoading: isAuthLoading } = useAuth();
  const { t } = useLanguage();
  const prevUserIdRef = useRef<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<ApiCoupon | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isSyncingCart, setIsSyncingCart] = useState(false);
  const [cartSyncNotice, setCartSyncNotice] = useState<string | null>(null);

  const clearCartSyncNotice = useCallback(() => {
    setCartSyncNotice(null);
  }, []);

  const syncCartWithServer = useCallback(
    async (itemsToSync: CartItem[]) => {
      if (itemsToSync.length === 0) return;
      const variantIds = itemsToSync
        .map((item) => item.variantId || item.id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0);

      if (variantIds.length === 0) return;

      try {
        setIsSyncingCart(true);
        const res = await catalogRequester.syncCart(variantIds);
        if (!res.items || res.items.length === 0) return;

        const serverMap = new Map(
          res.items.map((item) => [item.variantId, item]),
        );

        let hasPriceChanges = false;

        setItems((prevItems) => {
          let hasDiff = false;
          const updated = prevItems.map((item) => {
            const vId = item.variantId || item.id;
            const serverItem = serverMap.get(vId);
            if (!serverItem) {
              if (item.isAvailable !== false) {
                hasDiff = true;
                return { ...item, isAvailable: false };
              }
              return item;
            }

            const isPriceDiff = Math.abs(item.price - serverItem.price) > 0.01;
            const isStockDiff = item.maxStock !== serverItem.stock;
            const isAvailDiff = item.isAvailable !== serverItem.isAvailable;

            if (isPriceDiff) {
              hasPriceChanges = true;
            }

            if (
              isPriceDiff ||
              isStockDiff ||
              isAvailDiff ||
              item.name !== serverItem.productName
            ) {
              hasDiff = true;
              return {
                ...item,
                price: serverItem.price,
                basePrice: serverItem.basePrice,
                originalPrice: serverItem.originalPrice ?? undefined,
                maxStock: serverItem.stock,
                name: serverItem.productName,
                nameTh: serverItem.productNameTh ?? item.nameTh,
                isAvailable: serverItem.isAvailable,
              };
            }
            return item;
          });

          return hasDiff ? updated : prevItems;
        });

        if (hasPriceChanges) {
          setCartSyncNotice(t('cart.pricesSynced'));
        }
      } catch (err) {
        console.warn('[CartContext] Auto-sync cart items failed:', err);
      } finally {
        setIsSyncingCart(false);
      }
    },
    [t],
  );

  const syncCart = useCallback(async () => {
    await syncCartWithServer(items);
  }, [items, syncCartWithServer]);

  // Restore cart and coupon from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
          syncCartWithServer(parsed);
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

  // Save guest cart to localStorage (only when user is not logged in)
  useEffect(() => {
    if (!isHydrated || user) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore quota errors
    }
  }, [items, isHydrated, user]);

  // Synchronize cart with backend database when user logs in or logs out
  useEffect(() => {
    if (isAuthLoading) return;

    const currentUserId = user?.id ?? null;
    const prevUserId = prevUserIdRef.current;

    // Detect logout or account switch
    if (prevUserId && (!currentUserId || currentUserId !== prevUserId)) {
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
    }

    // Detect login
    if (currentUserId && token && currentUserId !== prevUserId) {
      const syncUserCart = async () => {
        try {
          setIsSyncingCart(true);

          // Retrieve guest items from either localStorage or current state
          let guestItems: CartItem[] = [];
          try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed) && parsed.length > 0) {
                guestItems = parsed;
              }
            }
          } catch {
            // Ignore
          }

          if (guestItems.length === 0 && items.length > 0) {
            guestItems = items;
          }

          const UUID_REGEX =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

          const validPayloadItems = guestItems
            .map((i) => {
              let resolvedId: string | null = null;
              if (i.variantId && UUID_REGEX.test(i.variantId)) {
                resolvedId = i.variantId;
              } else if (i.productId && UUID_REGEX.test(i.productId)) {
                resolvedId = i.productId;
              } else if (i.id && UUID_REGEX.test(i.id.slice(0, 36))) {
                resolvedId = i.id.slice(0, 36);
              }
              return resolvedId
                ? { variantId: resolvedId, quantity: Math.max(i.quantity, 1) }
                : null;
            })
            .filter(
              (item): item is { variantId: string; quantity: number } =>
                Boolean(item),
            );

          if (validPayloadItems.length > 0) {
            const mergedRes = await cartRequester.mergeCart(
              validPayloadItems,
              token,
            );

            if (mergedRes.items && mergedRes.items.length > 0) {
              try {
                localStorage.removeItem(CART_STORAGE_KEY);
              } catch {
                // Ignore
              }

              const mapped: CartItem[] = mergedRes.items.map((serverItem) => ({
                id: serverItem.id,
                productId: serverItem.productId,
                slug: serverItem.slug,
                name: serverItem.name,
                nameTh: serverItem.nameTh ?? undefined,
                price: serverItem.price,
                basePrice: serverItem.basePrice,
                originalPrice: serverItem.originalPrice ?? undefined,
                image: serverItem.image,
                primaryImage: serverItem.image,
                department: 'apparel',
                categorySlug: 'apparel',
                variantId: serverItem.variantId,
                sku: serverItem.sku,
                quantity: serverItem.quantity,
                selectedSize: serverItem.size,
                selectedColor: serverItem.colorName,
                maxStock: serverItem.maxStock,
                isPreorder: serverItem.isPreorder,
                isActive: serverItem.isActive,
                isAvailable: serverItem.isAvailable ?? (serverItem.isActive !== false),
              }));
              setItems(mapped);
              return;
            }
          }

          // Fetch user cart from DB if no guest items were merged
          const serverCart = await cartRequester.getCart(token);
          if (serverCart.items && serverCart.items.length > 0) {
            const mapped: CartItem[] = serverCart.items.map((serverItem) => ({
              id: serverItem.id,
              productId: serverItem.productId,
              slug: serverItem.slug,
              name: serverItem.name,
              nameTh: serverItem.nameTh ?? undefined,
              price: serverItem.price,
              basePrice: serverItem.basePrice,
              originalPrice: serverItem.originalPrice ?? undefined,
              image: serverItem.image,
              primaryImage: serverItem.image,
              department: 'apparel',
              categorySlug: 'apparel',
              variantId: serverItem.variantId,
              sku: serverItem.sku,
              quantity: serverItem.quantity,
              selectedSize: serverItem.size,
              selectedColor: serverItem.colorName,
              maxStock: serverItem.maxStock,
              isPreorder: serverItem.isPreorder,
              isActive: serverItem.isActive,
              isAvailable: serverItem.isAvailable ?? (serverItem.isActive !== false),
            }));
            setItems(mapped);
          } else if (guestItems.length > 0) {
            // Retain guest items if server had no items
            setItems(guestItems);
          }
        } catch (err) {
          console.warn('[CartContext] Failed to sync customer cart on login:', err);
        } finally {
          setIsSyncingCart(false);
        }
      };

      syncUserCart();
    }

    prevUserIdRef.current = currentUserId;
  }, [user?.id, token, isAuthLoading]);

  // Save coupon to localStorage whenever coupon changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch {
      // Ignore quota errors
    }
  }, [appliedCoupon, isHydrated]);

  // Auto-sync cart with server whenever the cart drawer opens
  useEffect(() => {
    if (isCartOpen && items.length > 0) {
      syncCartWithServer(items);
    }
  }, [isCartOpen, syncCartWithServer]);

  const cartTotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);

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

  const freeShippingRemaining = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - cartTotal,
  );

  const isItemUnavailable = (item: CartItem): boolean =>
    item.isAvailable === false ||
    item.isActive === false ||
    (item.maxStock <= 0 && !item.isPreorder);

  const unavailableItems = items.filter(isItemUnavailable);
  const hasUnavailableItems = unavailableItems.length > 0;
  const unavailableItemsCount = unavailableItems.length;

  const removeUnavailableItems = useCallback(() => {
    setItems((prev) => {
      const remaining = prev.filter((item) => !isItemUnavailable(item));
      const removed = prev.filter(isItemUnavailable);
      if (token && removed.length > 0) {
        removed.forEach((item) => {
          if (item.variantId) {
            cartRequester.removeItem(item.variantId, token);
          }
        });
      }
      return remaining;
    });
  }, [token]);

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

  const clearCouponError = useCallback(() => {
    setCouponError(null);
  }, []);

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
    product: ApiProduct | ApiProductDetail,
    size?: string,
    color?: string,
    explicitVariantId?: string,
  ) => {
    const rawColors =
      'colors' in product && Array.isArray(product.colors)
        ? product.colors
        : [];
    const firstColor =
      rawColors.length > 0
        ? typeof rawColors[0] === 'string'
          ? rawColors[0]
          : rawColors[0].name
        : 'Classic';

    const variants =
      'variants' in product && Array.isArray(product.variants)
        ? product.variants
        : undefined;

    const availableSizes = variants
      ? Array.from(new Set(variants.map((v) => v.size).filter(Boolean)))
      : [];

    const isOneSize = isOneSizeProduct(product);

    let chosenSize: string;
    if (size) {
      if (availableSizes.length > 0) {
        chosenSize =
          availableSizes.find((s) => s.toLowerCase() === size.toLowerCase()) ??
          size;
      } else {
        chosenSize = size;
      }
    } else if (isOneSize) {
      chosenSize = 'One Size';
    } else if (availableSizes.length > 0) {
      chosenSize = availableSizes[0] ?? 'One Size';
    } else {
      const fallbackSizes = getProductSizes(product);
      chosenSize = fallbackSizes[0] ?? 'One Size';
    }

    const chosenColor = color || firstColor;

    // Resolve variant matching chosen size & color
    const matchedVariant =
      variants?.find((v) => {
        const matchSize =
          !chosenSize || v.size.toLowerCase() === chosenSize.toLowerCase();
        const matchColor =
          !chosenColor ||
          v.colorName.toLowerCase() === chosenColor.toLowerCase() ||
          v.colorHex.toLowerCase() === chosenColor.toLowerCase();
        return matchSize && matchColor;
      }) ?? variants?.[0];

    const variantId = explicitVariantId ?? matchedVariant?.id ?? product.id;
    const sku = matchedVariant?.sku ?? product.slug;
    const maxStock = matchedVariant?.quantityAvailable ?? 99;

    const primaryImage =
      'primaryImage' in product && typeof product.primaryImage === 'string'
        ? product.primaryImage
        : 'images' in product && Array.isArray(product.images)
          ? (product.images.find((img) => img.isPrimary)?.imageUrl ??
            product.images[0]?.imageUrl ??
            '')
          : '';

    const price = matchedVariant?.price ?? product.basePrice;
    const originalPrice =
      matchedVariant?.compareAtPrice ?? product.originalPrice;
    const department = String(product.department ?? '').toLowerCase();
    const categorySlug =
      'categorySlug' in product && typeof product.categorySlug === 'string'
        ? product.categorySlug
        : 'category' in product &&
            typeof product.category === 'object' &&
            product.category !== null
          ? product.category.slug
          : 'apparel';
    const categoryName =
      'categoryName' in product && typeof product.categoryName === 'string'
        ? product.categoryName
        : 'category' in product &&
            typeof product.category === 'object' &&
            product.category !== null
          ? product.category.name
          : undefined;
    const categoryNameTh =
      'categoryNameTh' in product && typeof product.categoryNameTh === 'string'
        ? product.categoryNameTh
        : 'category' in product &&
            typeof product.category === 'object' &&
            product.category !== null
          ? product.category.nameTh
          : undefined;

    const isVariantActive =
      matchedVariant?.isActive !== false && product.isActive !== false;

    setItems((prev) => {
      let finalQty = 1;
      const existing = prev.find(
        (item) =>
          item.variantId === variantId ||
          (item.productId === product.id &&
            item.selectedSize === chosenSize &&
            item.selectedColor === chosenColor),
      );

      let nextItems: CartItem[];
      if (existing) {
        finalQty = Math.min(existing.quantity + 1, existing.maxStock || 99);
        nextItems = prev.map((item) =>
          item === existing ? { ...item, quantity: finalQty } : item,
        );
      } else {
        nextItems = [
          ...prev,
          {
            id: `${product.id}-${chosenSize}-${chosenColor}`,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            nameTh: product.nameTh,
            price,
            basePrice: product.basePrice,
            originalPrice,
            image: primaryImage,
            primaryImage,
            department,
            categorySlug,
            categoryName,
            categoryNameTh,
            variantId,
            sku,
            quantity: 1,
            selectedSize: chosenSize,
            selectedColor: chosenColor,
            maxStock,
            isPreorder: product.isPreorder,
            isActive: isVariantActive,
            isAvailable: isVariantActive,
          },
        ];
      }

      if (token) {
        cartRequester.updateItem(variantId, finalQty, token);
      }

      return nextItems;
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (identifier: string) => {
    setItems((prev) => {
      const target = prev.find(
        (item) => item.variantId === identifier || item.id === identifier,
      );
      if (token && target?.variantId) {
        cartRequester.removeItem(target.variantId, token);
      }
      return prev.filter(
        (item) => item.variantId !== identifier && item.id !== identifier,
      );
    });
  };

  const updateQuantity = (identifier: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(identifier);
      return;
    }

    setItems((prev) => {
      const target = prev.find(
        (item) => item.variantId === identifier || item.id === identifier,
      );
      const validQty = Math.min(quantity, target?.maxStock || 99);

      if (token && target?.variantId) {
        cartRequester.updateItem(target.variantId, validQty, token);
      }

      return prev.map((item) => {
        if (item.variantId === identifier || item.id === identifier) {
          return { ...item, quantity: validQty };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    if (token) {
      cartRequester.clearCart(token);
    }
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

  const updateItemPrices = useCallback(
    (updates: Array<{ variantId: string; newPrice: number }>) => {
      const priceMap = new Map(updates.map((u) => [u.variantId, u.newPrice]));
      setItems((prev) =>
        prev.map((item) => {
          const newPrice = priceMap.get(item.variantId || item.id);
          if (newPrice !== undefined) {
            return { ...item, price: newPrice };
          }
          return item;
        }),
      );
    },
    [],
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemPrices,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartTotal,
        totalQuantity,
        hasUnavailableItems,
        unavailableItemsCount,
        removeUnavailableItems,
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
        clearCouponError,
        isApplyingCoupon,
        applyCoupon,
        removeCoupon,
        isSyncingCart,
        cartSyncNotice,
        clearCartSyncNotice,
        syncCart,
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
