// ====================================================
// @repo/types — Coupon Types (คูปอง & โปรโมชัน)
// ====================================================

import type { DiscountType, MembershipTier } from './enums.js';

export interface ApiCoupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  totalUsageLimit: number;
  userUsageLimit: number;
  currentUsageCount: number;
  applicableTier?: MembershipTier;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
}

// ----- Validation Result -----

export interface CouponValidationResult {
  valid: boolean;
  coupon?: ApiCoupon;
  discountAmount?: number;
  reason?: CouponInvalidReason;
}

export type CouponInvalidReason =
  | 'NOT_FOUND'
  | 'EXPIRED'
  | 'NOT_YET_ACTIVE'
  | 'USAGE_LIMIT_REACHED'
  | 'USER_LIMIT_REACHED'
  | 'MIN_ORDER_NOT_MET'
  | 'TIER_NOT_ELIGIBLE'
  | 'INACTIVE';
