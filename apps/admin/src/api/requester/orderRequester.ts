import { apiClient } from '../client';
import type { ApiOrder, OrderStatus } from '@repo/types';

export interface FulfillOrderPayload {
  courierName: string;
  trackingNumber: string;
  initialStatusTitle?: string;
  estimatedDelivery?: string;
}

export const orderRequester = {
  async getOrders(): Promise<ApiOrder[]> {
    const data = await apiClient.get<ApiOrder[]>('/admin/orders');
    return data;
  },

  async getByNumber(orderNumber: string): Promise<ApiOrder> {
    const data = await apiClient.get<ApiOrder>(`/orders/${orderNumber}`);
    return data;
  },

  async updateStatus(
    id: string,
    status: OrderStatus,
    courierName?: string,
    trackingNumber?: string,
  ): Promise<ApiOrder> {
    const data = await apiClient.patch<ApiOrder>(`/orders/${id}/status`, {
      status,
      courierName,
      trackingNumber,
    });
    return data;
  },

  async fulfill(orderIdentifier: string, payload: FulfillOrderPayload): Promise<unknown> {
    const data = await apiClient.post(`/admin/orders/${orderIdentifier}/fulfill`, payload);
    return data;
  },
};

export const ordersApi = orderRequester;
