import { apiClient } from '../client';
import type { InventoryItem, StockMovement } from '../../data/adminData';

export interface AdjustStockPayload {
  sku: string;
  quantityChange: number;
  reason: string;
  updatedBy: string;
}

export const inventoryRequester = {
  async getAll(): Promise<InventoryItem[]> {
    const data = await apiClient.get<InventoryItem[]>('/admin/inventory');
    return data;
  },

  async adjustStock(payload: AdjustStockPayload): Promise<InventoryItem> {
    const data = await apiClient.post<InventoryItem>('/admin/inventory/adjust', payload);
    return data;
  },

  async getMovements(): Promise<StockMovement[]> {
    const data = await apiClient.get<StockMovement[]>('/admin/inventory/movements');
    return data;
  },
};

export const inventoryApi = inventoryRequester;
