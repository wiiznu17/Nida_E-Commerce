/**
 * Orders Requester for Nida Admin
 *
 * Dedicated requester functions for customer orders & fulfillment.
 */
import { apiClient } from './client';
import type { AdminOrder } from '../data/adminData';

export interface UpdateOrderStatusPayload {
  status: AdminOrder['status'];
  courierName?: string;
  trackingNumber?: string;
}

export const ordersApi = {
  /**
   * Fetch all customer orders.
   */
  async getAll(): Promise<AdminOrder[]> {
    return apiClient.get<AdminOrder[]>('/admin/orders');
  },

  /**
   * Fetch a single order by ID.
   */
  async getById(id: string): Promise<AdminOrder> {
    return apiClient.get<AdminOrder>(`/admin/orders/${id}`);
  },

  /**
   * Update order status, tracking code, and courier.
   */
  async updateStatus(
    orderId: string,
    payload: UpdateOrderStatusPayload,
  ): Promise<AdminOrder> {
    return apiClient.patch<AdminOrder>(`/admin/orders/${orderId}/status`, payload);
  },
};
