import { apiClient } from '../client';
import type { ApiInventoryItem, Department } from '@repo/types';

export interface RestockInventoryPayload {
  variantId: string;
  quantity: number;
  reasonNote: string;
  adminId?: string;
}

export const inventoryRequester = {
  async getInventory(params?: {
    department?: Department;
    lowStockOnly?: boolean;
  }): Promise<ApiInventoryItem[]> {
    const data = await apiClient.get<ApiInventoryItem[]>(
      '/admin/inventory',
      params as Record<string, string | number | boolean | undefined>,
    );
    return data;
  },

  async restock(payload: RestockInventoryPayload): Promise<ApiInventoryItem> {
    const data = await apiClient.post<ApiInventoryItem>('/admin/inventory/restock', payload);
    return data;
  },
};

export const inventoryApi = inventoryRequester;
