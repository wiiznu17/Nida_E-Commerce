// ====================================================
// @repo/types — Admin Order Fulfillment & Carrier Types
// ====================================================

import type { CarrierCode, ShipmentStatus } from '../common/enums.js';

export type { CarrierCode };

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
