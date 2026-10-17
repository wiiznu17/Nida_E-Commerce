// ====================================================
// @repo/types — Admin Order Fulfillment & Carrier Types
// ====================================================

import type { CarrierCode, ShipmentStatus } from '../common/enums.js';

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

// --- Admin Refund Processing ---
export interface ProcessRefundDto {
  amount?: number;
  reason: string;
  restockInventory?: boolean;
}

// --- Admin Cancellation Review ---
export interface ReviewCancellationRequestDto {
  action: 'APPROVE' | 'REJECT';
  adminNote?: string;
  restockInventory?: boolean;
}

// --- Admin Return Review ---
export interface ReviewReturnRequestDto {
  action: 'APPROVE' | 'REJECT' | 'COMPLETE';
  adminNote?: string;
  restockInventory?: boolean;
  refundAmount?: number;
}
