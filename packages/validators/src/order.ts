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
    const nextList = allowedNext && allowedNext.length > 0 ? allowedNext.join(', ') : 'None (Terminal state)';
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

export const orderItemSchema = z.object({
  variantId: z.string().uuid({ message: 'Invalid variant ID format' }),
  quantity: z.number().int().min(1, { message: 'Quantity must be at least 1' }),
});

export const shippingAddressSchema = z.object({
  recipientName: z.string().min(1, { message: 'Recipient name is required' }),
  phone: z.string().min(9, { message: 'Phone number must be at least 9 digits' }),
  addressLine1: z.string().min(1, { message: 'Address line 1 is required' }),
  addressLine2: z.string().optional(),
  subdistrict: z.string().min(1, { message: 'Subdistrict is required' }),
  district: z.string().min(1, { message: 'District is required' }),
  province: z.string().min(1, { message: 'Province is required' }),
  postalCode: z.string().length(5, { message: 'Postal code must be 5 digits' }),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, { message: 'Order must contain at least 1 item' }),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(['PROMPTPAY', 'CREDIT_CARD', 'BANK_TRANSFER', 'COD']),
  couponCode: z.string().optional(),
  userId: z.string().uuid().optional(),
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

