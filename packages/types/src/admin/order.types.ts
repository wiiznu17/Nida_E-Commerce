// ====================================================
// @repo/types — Admin Order Fulfillment & Carrier Types
// ====================================================

import type { ShipmentStatus } from '../common/enums.js';

export type CarrierCode =
  | 'KERRY_EXPRESS'
  | 'FLASH_EXPRESS'
  | 'THAILAND_POST_EMS'
  | 'DHL_EXPRESS';

export interface CarrierBookingRequest {
  orderId: string;
  carrierCode: CarrierCode;
}

export interface CarrierBookingResult {
  orderId: string;
  orderNumber: string;
  carrierCode: CarrierCode;
  courierName: string;
  trackingNumber: string;
  status: ShipmentStatus;
  estimatedDelivery: string;
  bookedAt: string;
}
