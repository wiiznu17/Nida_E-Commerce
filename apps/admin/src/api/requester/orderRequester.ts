import { apiClient } from '../client';
import type { AdminOrder } from '../../data/adminData';

export interface UpdateOrderStatusPayload {
  status: AdminOrder['status'];
  courierName?: string;
  trackingNumber?: string;
}

export const orderRequester = {
  async getAll(): Promise<AdminOrder[]> {
    const data = await apiClient.get<AdminOrder[]>('/admin/orders');
    return data;
  },

  async getById(id: string): Promise<AdminOrder> {
    const data = await apiClient.get<AdminOrder>(`/admin/orders/${id}`);
    return data;
  },

  async updateStatus(
    orderId: string,
    payload: UpdateOrderStatusPayload,
  ): Promise<AdminOrder> {
    const data = await apiClient.patch<AdminOrder>(`/admin/orders/${orderId}/status`, payload);
    return data;
  },
};

export const ordersApi = orderRequester;
