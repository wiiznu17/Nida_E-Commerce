import { apiClient } from '../client';
import type { ApiCoupon, DiscountType } from '@repo/types';

export interface CreateCouponPayload {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  totalUsageLimit?: number;
  userUsageLimit?: number;
  startsAt?: string;
  expiresAt: string;
  isActive?: boolean;
}

export const promotionRequester = {
  async getAll(): Promise<ApiCoupon[]> {
    return apiClient.get<ApiCoupon[]>('/coupons');
  },

  async create(payload: CreateCouponPayload): Promise<ApiCoupon> {
    return apiClient.post<ApiCoupon>('/coupons', payload);
  },

  async toggle(identifier: string): Promise<ApiCoupon> {
    return apiClient.patch<ApiCoupon>(`/coupons/${identifier}/toggle`);
  },

  async delete(identifier: string): Promise<{ success: boolean; id: string }> {
    return apiClient.delete<{ success: boolean; id: string }>(
      `/coupons/${identifier}`,
    );
  },
};

export const promotionsApi = promotionRequester;
