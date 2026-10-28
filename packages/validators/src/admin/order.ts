import { z } from 'zod';
import type { OrderStatus, ShipmentStatus } from '@repo/types';

/**
 * Sequential State Machine Transitions for E-commerce Orders.
 * Strictly forbids skipping steps (e.g. PAID -> SHIPPED without PROCESSING, or PAID -> DELIVERED).
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED', 'REFUNDED'],
  PREORDER_AWAITING_STOCK: ['PROCESSING', 'CANCELLED', 'REFUNDED'],
  PROCESSING: ['SHIPPED', 'CANCELLED', 'REFUNDED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['COMPLETED', 'REFUNDED'],
  COMPLETED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

/**
 * Strict Sequential State Machine Transitions for Shipments.
 * Enforces stepwise progression (LABEL_CREATED -> PICKED_UP -> IN_TRANSIT -> OUT_FOR_DELIVERY -> DELIVERED).
 * Forbids skipping milestones or reverting terminal / past statuses.
 */
export const ALLOWED_SHIPMENT_TRANSITIONS: Record<
  ShipmentStatus,
  ShipmentStatus[]
> = {
  LABEL_CREATED: ['PICKED_UP'],
  PICKED_UP: ['IN_TRANSIT'],
  IN_TRANSIT: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED'],
  FAILED: ['OUT_FOR_DELIVERY'],
  DELIVERED: [],
};

export function validateShipmentStatusTransition(
  currentStatus: ShipmentStatus,
  newStatus: ShipmentStatus,
): { isValid: boolean; error?: string; errorTh?: string } {
  if (currentStatus === 'DELIVERED') {
    return {
      isValid: false,
      error: 'Cannot update or revert status of an already delivered shipment.',
      errorTh: 'พัสดุนี้จัดส่งสำเร็จเรียบร้อยแล้ว ไม่สามารถย้อนกลับหรือเปลี่ยนสถานะได้',
    };
  }

  if (currentStatus === newStatus) {
    return { isValid: true };
  }

  const allowed = ALLOWED_SHIPMENT_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(newStatus)) {
    const allowedList =
      allowed && allowed.length > 0 ? allowed.join(', ') : 'None (Terminal)';
    return {
      isValid: false,
      error: `Invalid shipment status transition from "${currentStatus}" to "${newStatus}". Allowed next: ${allowedList}.`,
      errorTh: `ไม่สามารถเปลี่ยนสถานะพัสดุจาก "${currentStatus}" ไปเป็น "${newStatus}" ได้ สถานะถัดไปที่อนุญาตคือ: ${allowedList}`,
    };
  }

  return { isValid: true };
}

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
  carrierCode: z.enum([
    'KERRY_EXPRESS',
    'FLASH_EXPRESS',
    'THAILAND_POST_EMS',
    'DHL_EXPRESS',
  ]),
  trackingNumber: z
    .string()
    .trim()
    .min(3, 'Tracking number must be at least 3 characters'),
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

export type UpdateShipmentStatusInput = z.infer<
  typeof updateShipmentStatusSchema
>;

/**
 * Admin Process Refund Schema
 */
export const processRefundSchema = z.object({
  amount: z.number().positive('Refund amount must be positive').optional(),
  reason: z
    .string()
    .trim()
    .min(3, 'Refund reason must be at least 3 characters'),
  restockInventory: z.boolean().default(true),
});

export type ProcessRefundInput = z.infer<typeof processRefundSchema>;

/**
 * Admin Review Cancellation Request Schema
 */
export const reviewCancellationRequestSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  adminNote: z.string().trim().optional(),
  restockInventory: z.boolean().default(true),
});

export type ReviewCancellationRequestInput = z.infer<
  typeof reviewCancellationRequestSchema
>;

/**
 * Admin Review Return Request Schema
 */
export const reviewReturnRequestSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'COMPLETE']),
  adminNote: z.string().trim().optional(),
  restockInventory: z.boolean().default(true),
  refundAmount: z.number().positive().optional(),
});

export type ReviewReturnRequestInput = z.infer<
  typeof reviewReturnRequestSchema
>;

/**
 * Admin Orders Query Schema (Server Search & Filter)
 */
export const adminOrderQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
  paymentMethod: z.string().trim().optional(),
  sortBy: z
    .enum(['newest', 'oldest', 'amount_desc', 'amount_asc'])
    .optional()
    .default('newest'),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(10),
});

export type AdminOrderQueryInput = z.infer<typeof adminOrderQuerySchema>;

/**
 * Admin Cancellation Requests Query Schema
 */
export const adminCancellationQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
  sortBy: z.enum(['newest', 'oldest']).optional().default('newest'),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(10),
});

export type AdminCancellationQueryInput = z.infer<
  typeof adminCancellationQuerySchema
>;

/**
 * Admin Return Requests Query Schema
 */
export const adminReturnQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
  sortBy: z.enum(['newest', 'oldest']).optional().default('newest'),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(10),
});

export type AdminReturnQueryInput = z.infer<typeof adminReturnQuerySchema>;
