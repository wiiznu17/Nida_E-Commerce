import { apiClient } from '../client';
import type {
  ApiInventoryItem,
  ApiStockMovement,
  Department,
  StockChangeType,
} from '@repo/types';

export interface RestockInventoryPayload {
  variantId: string;
  sku?: string;
  quantity: number;
  reasonNote: string;
  changeType?: StockChangeType;
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
    const data = await apiClient.post<ApiInventoryItem>(
      '/admin/inventory/restock',
      payload,
    );
    return data;
  },

  async adjustStock(payload: RestockInventoryPayload): Promise<ApiInventoryItem> {
    return this.restock(payload);
  },

  async getMovements(): Promise<ApiStockMovement[]> {
    const data = await apiClient.get<ApiStockMovement[]>(
      '/admin/inventory/movements',
    );
    return data;
  },
};

export const inventoryApi = inventoryRequester;
