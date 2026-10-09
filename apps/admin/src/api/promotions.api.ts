/**
 * Promotions Requester for Nida Admin
 *
 * Dedicated requester functions for promo codes & coupons.
 */
import { apiClient } from './client';
import type { PromoCoupon } from '../data/adminData';

export const promotionsApi = {
  /**
   * Fetch all promo coupons.
   */
  async getAll(): Promise<PromoCoupon[]> {
    return apiClient.get<PromoCoupon[]>('/coupons');
  },

  /**
   * Create a new coupon.
   */
  async create(coupon: PromoCoupon): Promise<PromoCoupon> {
    return apiClient.post<PromoCoupon>('/coupons', coupon);
  },

  /**
   * Toggle active state of a coupon.
   */
  async toggle(code: string): Promise<PromoCoupon> {
    return apiClient.patch<PromoCoupon>(`/coupons/${code}/toggle`);
  },

  /**
   * Delete a coupon by code.
   */
  async delete(code: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/coupons/${code}`);
  },
};
