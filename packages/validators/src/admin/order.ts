import { z } from 'zod';
import type { OrderStatus } from '@repo/types';

/**
 * Sequential State Machine Transitions for E-commerce Orders.
 * Strictly forbids skipping steps (e.g. PAID -> SHIPPED without PROCESSING, or PAID -> DELIVERED).
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED'],
  PREORDER_AWAITING_STOCK: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

export interface StatusTransitionValidationResult {
  isValid: boolean;
  error?: string;
  errorTh?: string;
}

/**
 * Validates order status transition and enforces tracking number requirement before dispatch.
 */
export function validateOrderStatusTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
  hasTrackingNumber: boolean,
): StatusTransitionValidationResult {
  if (currentStatus === newStatus) {
    return { isValid: true };
  }

  const allowedNext = ALLOWED_STATUS_TRANSITIONS[currentStatus];
  if (!allowedNext || !allowedNext.includes(newStatus)) {
    const nextList =
      allowedNext && allowedNext.length > 0
        ? allowedNext.join(', ')
        : 'None (Terminal state)';
    return {
      isValid: false,
      error: `Invalid status transition from "${currentStatus}" to "${newStatus}". Order status must progress step-by-step: PAID -> PROCESSING -> SHIPPED -> DELIVERED. Allowed next: ${nextList}.`,
      errorTh: `ไม่สามารถเปลี่ยนสถานะจาก "${currentStatus}" ข้ามไปเป็น "${newStatus}" ได้ ต้องดำเนินการตามขั้นตอน (PAID -> PROCESSING -> SHIPPED -> DELIVERED) สถานะถัดไปที่ทำได้คือ: ${nextList}`,
    };
  }

  if (newStatus === 'SHIPPED' && !hasTrackingNumber) {
    return {
      isValid: false,
      error: `Tracking number is required before transitioning order status to SHIPPED. Please fulfill and enter tracking number first.`,
      errorTh: `ต้องระบุเลขพัสดุ (Tracking Number) ก่อนเปลี่ยนสถานะเป็น 'จัดส่งแล้ว (SHIPPED)'`,
    };
  }

  return { isValid: true };
}

/**
 * Admin Fulfill Order Schema
 */
export const fulfillOrderSchema = z.object({
  carrierCode: z.enum(['KERRY_EXPRESS', 'FLASH_EXPRESS', 'THAILAND_POST_EMS', 'DHL_EXPRESS']),
  trackingNumber: z.string().trim().min(3, 'Tracking number must be at least 3 characters'),
  adminNote: z.string().trim().optional(),
});

export type FulfillOrderInput = z.infer<typeof fulfillOrderSchema>;

/**
 * Admin Update Shipment Status Schema
 */
export const updateShipmentStatusSchema = z.object({
  status: z.enum([
    'LABEL_CREATED',
    'PICKED_UP',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'FAILED',
  ]),
  location: z.string().trim().optional(),
  description: z.string().trim().optional(),
});

export type UpdateShipmentStatusInput = z.infer<typeof updateShipmentStatusSchema>;
