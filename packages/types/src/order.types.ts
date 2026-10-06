// ====================================================
// @repo/types — Order Types (คำสั่งซื้อ & Shipment)
// ====================================================

import type { OrderStatus, PaymentMethod, PaymentStatus, ShipmentStatus } from './enums.js';

// ----- Order -----

export interface ApiOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  hasPreorderItems: boolean;

  // ยอดเงิน
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  promoCodeUsed?: string;

  // รายการ
  items: ApiOrderItem[];

  // ที่อยู่จัดส่ง (Snapshot ณ ตอนสั่ง)
  shippingAddress: ApiOrderAddress;

  // การชำระเงิน
  payment?: ApiPaymentSummary;

  // การจัดส่ง
  shipments: ApiShipment[];

  placedAt: string;
}

export interface ApiOrderItem {
  id: string;
  productName: string;
  variantInfo: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  discountShare: number;
  netPrice: number;
  isPreorder: boolean;
  expectedShipDate?: string;
}

export interface ApiOrderAddress {
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
}

export interface ApiPaymentSummary {
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  cardLast4?: string;
  cardBrand?: string;
  paidAt?: string;
}

// ----- Shipment & Tracking -----

export interface ApiShipment {
  id: string;
  courierName: string;
  trackingNumber: string;
  status: ShipmentStatus;
  shippedAt?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  timeline: ShipmentTimelineEntry[];
}

export interface ShipmentTimelineEntry {
  id: string;
  statusTitle: string;
  statusDescription?: string;
  location?: string;
  timestamp: string;
}

// ----- Tracking Page (สำหรับหน้า /track-order) -----

export interface TrackingResult {
  orderNumber: string;
  orderStatus: OrderStatus;
  shipment: ApiShipment;
}
