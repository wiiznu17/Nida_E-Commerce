import { apiClient } from '../client';
import type {
  CouponValidationResult,
  CheckoutCalculation,
} from '@repo/types';

export interface CalculateCheckoutPayload {
  items: Array<{
    variantId: string;
    quantity: number;
  }>;
  couponCode?: string;
  userId?: string;
}

export const couponRequester = {
  /**
   * Validate promotional coupon code and calculate discount.
   */
  validate: async (
    code: string,
    orderAmount: number,
    userId?: string,
  ): Promise<CouponValidationResult> => {
    return apiClient.post<CouponValidationResult>('/coupons/validate', {
      code: code.trim().toUpperCase(),
      orderAmount,
      userId,
    });
  },

  /**
   * Calculate checkout totals including pro-rata discount, shipping fee, and tax.
   */
  calculateCheckout: async (
    payload: CalculateCheckoutPayload,
  ): Promise<CheckoutCalculation> => {
    return apiClient.post<CheckoutCalculation>('/checkout/calculate', {
      ...payload,
      couponCode: payload.couponCode
        ? payload.couponCode.trim().toUpperCase()
        : undefined,
    });
  },
};
