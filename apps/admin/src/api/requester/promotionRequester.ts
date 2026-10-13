import { apiClient } from '../client';
import type { PromoCoupon } from '../../data/adminData';

export const promotionRequester = {
  async getAll(): Promise<PromoCoupon[]> {
    const data = await apiClient.get<PromoCoupon[]>('/coupons');
    return data;
  },

  async create(coupon: PromoCoupon): Promise<PromoCoupon> {
    const data = await apiClient.post<PromoCoupon>('/coupons', coupon);
    return data;
  },

  async toggle(code: string): Promise<PromoCoupon> {
    const data = await apiClient.patch<PromoCoupon>(`/coupons/${code}/toggle`);
    return data;
  },

  async delete(code: string): Promise<{ success: boolean }> {
    const data = await apiClient.delete<{ success: boolean }>(`/coupons/${code}`);
    return data;
  },
};

export const promotionsApi = promotionRequester;
