// ====================================================
// @repo/types — Inventory Types (สต็อก & การเคลื่อนไหว)
// ====================================================

import type { Department, StockChangeType } from '../common/enums.js';

export interface ApiInventoryItem {
  id: string;
  variantId?: string;
  sku: string;
  productId: string;
  productName: string;
  department: Department;
  categoryName: string;
  size: string;
  colorName: string;
  colorHex: string;
  imageUrl?: string;
  price: number;
  quantityAvailable: number;
  quantityReserved: number;
  preorderBooked: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  lastCountedAt?: string;
}

export interface ApiStockMovement {
  id: string;
  sku: string;
  productName: string;
  variantInfo: string;
  changeType: StockChangeType;
  quantityChange: number;
  balanceAfter: number;
  reason?: string;
  adminName?: string;
  createdAt: string;
}
