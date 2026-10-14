import type { ApiCoupon } from '@repo/types';

export interface SkuVariant {
  sku: string;
  size: string;
  colorName: string;
  colorHex: string;
  stock: number;
  lowStockThreshold: number;
  priceAdjustment?: number;
}

export interface InventoryItem {
  id: string;
  sku: string;
  productId: string;
  productName: string;
  department: string;
  category: string;
  size: string;
  colorName: string;
  colorHex: string;
  availableStock: number;
  reservedStock: number;
  lowStockThreshold: number;
  price: number;
  image: string;
}

export interface StockMovement {
  id: string;
  sku: string;
  productName: string;
  changeType: 'RESTOCK' | 'ADJUSTMENT' | 'DAMAGE' | 'ORDER_DEDUCT';
  quantityChange: number;
  balanceAfter: number;
  reason: string;
  adminName: string;
  timestamp: string;
}

export type PromoCoupon = ApiCoupon;
