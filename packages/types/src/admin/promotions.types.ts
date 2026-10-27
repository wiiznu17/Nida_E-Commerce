// @repo/types — Admin Coupon & Promotions Types

import type { DiscountType, MembershipTier } from '../common/enums.js';

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
  | 'INACTIVE'
  | 'ACCOUNT_REQUIRED';
