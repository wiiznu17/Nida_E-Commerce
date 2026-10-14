// ====================================================
// @repo/types — Cart Types (ตะกร้าสินค้า)
// ====================================================

export interface ApiCartItem {
  id: string;
  variantId: string;
  productName: string;
  productSlug: string;
  sku: string;
  size: string;
  colorName: string;
  colorHex: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  inStock: boolean;
  maxQuantity: number;
}

export interface ApiCart {
  id: string;
  items: ApiCartItem[];
  itemCount: number;
  subtotal: number;
}

// ----- Checkout Calculation -----

export interface CheckoutCalculation {
  items: CheckoutLineItem[];
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  couponApplied?: CheckoutCouponSummary;
}

export interface CheckoutLineItem {
  variantId: string;
  productName: string;
  variantInfo: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  discountShare: number;
  netPrice: number;
  weightGrams: number;
}

export interface CheckoutCouponSummary {
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
}
