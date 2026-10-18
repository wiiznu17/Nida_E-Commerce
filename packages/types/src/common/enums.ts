// ====================================================
// @repo/types — Prisma Database Schema Enums
// ====================================================
// 100% matched with packages/database/prisma/schema.prisma
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
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

// --- Payment ---
export const PaymentMethod = {
  CREDIT_CARD: 'CREDIT_CARD',
  PROMPTPAY: 'PROMPTPAY',
  BANK_TRANSFER: 'BANK_TRANSFER',
  COD: 'COD',
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
export type ShipmentStatus =
  (typeof ShipmentStatus)[keyof typeof ShipmentStatus];

// --- Logistics & Carriers ---
export const CarrierCode = {
  KERRY_EXPRESS: 'KERRY_EXPRESS',
  FLASH_EXPRESS: 'FLASH_EXPRESS',
  THAILAND_POST_EMS: 'THAILAND_POST_EMS',
  DHL_EXPRESS: 'DHL_EXPRESS',
} as const;
export type CarrierCode = (typeof CarrierCode)[keyof typeof CarrierCode];

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
export type StockChangeType =
  (typeof StockChangeType)[keyof typeof StockChangeType];
export type StockMovementType = StockChangeType;

// --- Customer ---
export const MembershipTier = {
  REGULAR: 'REGULAR',
  SILVER: 'SILVER',
  VIP_GOLD: 'VIP_GOLD',
  PLATINUM: 'PLATINUM',
} as const;
export type MembershipTier =
  (typeof MembershipTier)[keyof typeof MembershipTier];

// --- Loyalty & Points ---
export const PointChangeType = {
  EARNED_ORDER: 'EARNED_ORDER',
  REDEEMED_CHECKOUT: 'REDEEMED_CHECKOUT',
  REFUND_CANCEL: 'REFUND_CANCEL',
  MANUAL_ADJUSTMENT: 'MANUAL_ADJUSTMENT',
  EXPIRED: 'EXPIRED',
} as const;
export type PointChangeType =
  (typeof PointChangeType)[keyof typeof PointChangeType];

// --- Return ---
export const ReturnStatus = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
} as const;
export type ReturnStatus = (typeof ReturnStatus)[keyof typeof ReturnStatus];

// --- Cancellation Request ---
export const CancellationRequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type CancellationRequestStatus =
  (typeof CancellationRequestStatus)[keyof typeof CancellationRequestStatus];

// --- Refund ---
export const RefundStatus = {
  PENDING: 'PENDING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
} as const;
export type RefundStatus = (typeof RefundStatus)[keyof typeof RefundStatus];

// --- Audit Action ---
export const AuditActionType = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  STATUS_CHANGE: 'STATUS_CHANGE',
  REFUND: 'REFUND',
} as const;
export type AuditActionType =
  (typeof AuditActionType)[keyof typeof AuditActionType];

// --- CMS & Marketing ---
export const BannerPlacement = {
  HERO_HOME: 'HERO_HOME',
  COLLECTION_TOP: 'COLLECTION_TOP',
  PROMO_BAR: 'PROMO_BAR',
} as const;
export type BannerPlacement =
  (typeof BannerPlacement)[keyof typeof BannerPlacement];
