/**
 * Inventory Requester for Nida Admin
 *
 * Dedicated requester functions for warehouse & stock management.
 */
import { apiClient } from './client';
import type { InventoryItem, StockMovement } from '../data/adminData';

export interface AdjustStockPayload {
  sku: string;
  quantityChange: number;
  reason: string;
  updatedBy: string;
}

export const inventoryApi = {
  /**
   * Fetch all inventory items across warehouses.
   */
  async getAll(): Promise<InventoryItem[]> {
    return apiClient.get<InventoryItem[]>('/admin/inventory');
  },

  /**
   * Adjust available stock for a specific SKU.
   */
  async adjustStock(payload: AdjustStockPayload): Promise<InventoryItem> {
    return apiClient.post<InventoryItem>('/admin/inventory/adjust', payload);
  },

  /**
   * Fetch stock movement history.
   */
  async getMovements(): Promise<StockMovement[]> {
    return apiClient.get<StockMovement[]>('/admin/inventory/movements');
  },
};
