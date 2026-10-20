// @repo/types — Admin Product Management Types

export interface ProductSkuVariant {
  sku: string;
  size: string;
  colorName: string;
  colorHex: string;
  stock: number;
  lowStockThreshold: number;
  priceAdjustment: number;
  barcode?: string | null;
  weightGrams?: number | null;
}
