// ====================================================
// @repo/types — Customer Order & Tracking Types (Storefront)
// ====================================================

import type {
  CarrierCode,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ShipmentStatus,
} from '../common/enums.js';

export interface ApiOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  hasPreorderItems: boolean;

  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  promoCodeUsed?: string;

  items: ApiOrderItem[];
  shippingAddress: ApiOrderAddress;
  payment?: ApiPaymentSummary;
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

export interface ApiShipment {
  id: string;
  carrierCode?: CarrierCode;
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

export interface TrackingResult {
  orderNumber: string;
  orderStatus: OrderStatus;
  shipment: ApiShipment;
}
