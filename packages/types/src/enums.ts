// ====================================================
// @repo/types — Shared Enums
// ====================================================
// Uses `as const` object + type union pattern for 100% compatibility
// with Prisma 7 generated enums and string literals.

// --- Product & Catalog ---
export const Department = {
  WOMEN: 'WOMEN',
  MEN: 'MEN',
  KIDS: 'KIDS',
  BAGS: 'BAGS',
  SHOES: 'SHOES',
  HOME: 'HOME',
} as const;
export type Department = (typeof Department)[keyof typeof Department];

// --- Order Lifecycle ---
export const OrderStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  PREORDER_AWAITING_STOCK: 'PREORDER_AWAITING_STOCK',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

// --- Payment ---
export const PaymentMethod = {
  CREDIT_CARD: 'CREDIT_CARD',
  PROMPTPAY: 'PROMPTPAY',
  BANK_TRANSFER: 'BANK_TRANSFER',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentStatus = {
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  CAPTURED: 'CAPTURED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

// --- Shipment ---
export const ShipmentStatus = {
  LABEL_CREATED: 'LABEL_CREATED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
} as const;
export type ShipmentStatus = (typeof ShipmentStatus)[keyof typeof ShipmentStatus];

// --- Coupon & Promotion ---
export const DiscountType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
  FREE_SHIPPING: 'FREE_SHIPPING',
} as const;
export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];

// --- Inventory ---
export const StockChangeType = {
  RESTOCK: 'RESTOCK',
  MANUAL_ADJUSTMENT: 'MANUAL_ADJUSTMENT',
  ORDER_DEDUCT: 'ORDER_DEDUCT',
  PREORDER_RECEIVE: 'PREORDER_RECEIVE',
  DAMAGE: 'DAMAGE',
  RETURNED: 'RETURNED',
} as const;
export type StockChangeType = (typeof StockChangeType)[keyof typeof StockChangeType];

// --- Customer ---
export const MembershipTier = {
  REGULAR: 'REGULAR',
  SILVER: 'SILVER',
  VIP_GOLD: 'VIP_GOLD',
  PLATINUM: 'PLATINUM',
} as const;
export type MembershipTier = (typeof MembershipTier)[keyof typeof MembershipTier];

// --- Return ---
export const ReturnStatus = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
} as const;
export type ReturnStatus = (typeof ReturnStatus)[keyof typeof ReturnStatus];

// --- Refund ---
export const RefundStatus = {
  PENDING: 'PENDING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
} as const;
export type RefundStatus = (typeof RefundStatus)[keyof typeof RefundStatus];

// ====================================================
// UI-only Enums (ไม่มีใน Prisma schema)
// ====================================================

export const SortBy = {
  NEWEST: 'newest',
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  BESTSELLER: 'bestseller',
  RATING: 'rating',
} as const;
export type SortBy = (typeof SortBy)[keyof typeof SortBy];

export const ProductTag = {
  BESTSELLER: 'BESTSELLER',
  NEW_ARRIVAL: 'NEW ARRIVAL',
  SALE: 'SALE',
  LIMITED_EDITION: 'LIMITED EDITION',
  PRE_ORDER: 'PRE-ORDER',
} as const;
export type ProductTag = (typeof ProductTag)[keyof typeof ProductTag];
