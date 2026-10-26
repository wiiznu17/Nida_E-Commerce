import { z } from 'zod';

export const orderItemSchema = z.object({
  variantId: z.string().uuid({ message: 'Invalid variant ID format' }),
  quantity: z.number().int().min(1, { message: 'Quantity must be at least 1' }),
  expectedPrice: z.number().min(0).optional(),
});

export const shippingAddressSchema = z.object({
  recipientName: z.string().min(1, { message: 'Recipient name is required' }),
  phone: z
    .string()
    .min(9, { message: 'Phone number must be at least 9 digits' }),
  addressLine1: z.string().min(1, { message: 'Address line 1 is required' }),
  addressLine2: z.string().optional(),
  subdistrict: z.string().min(1, { message: 'Subdistrict is required' }),
  district: z.string().min(1, { message: 'District is required' }),
  province: z.string().min(1, { message: 'Province is required' }),
  postalCode: z.string().length(5, { message: 'Postal code must be 5 digits' }),
});

export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, { message: 'Order must contain at least 1 item' }),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(['PROMPTPAY', 'CREDIT_CARD', 'BANK_TRANSFER', 'COD']),
  couponCode: z.string().optional(),
  userId: z.string().uuid().optional(),
  cfTurnstileToken: z.string().optional(),
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

/**
 * Customer Cancellation Request Schema
 */
export const createCancellationRequestSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, { message: 'Cancellation reason is required' }),
  customerNote: z.string().trim().optional(),
});

export type CreateCancellationRequestInput = z.infer<
  typeof createCancellationRequestSchema
>;

/**
 * Customer Return Request Schema
 */
export const returnItemSchema = z.object({
  orderItemId: z.string().uuid({ message: 'Invalid order item ID' }),
  quantity: z.number().int().min(1, { message: 'Quantity must be at least 1' }),
});

export const createReturnRequestSchema = z.object({
  reason: z.string().trim().min(3, { message: 'Return reason is required' }),
  customerNote: z.string().trim().optional(),
  items: z
    .array(returnItemSchema)
    .min(1, { message: 'Please select at least one item to return' }),
});

export type CreateReturnRequestInput = z.infer<
  typeof createReturnRequestSchema
>;

/**
 * Customer Return Shipment Submission Schema
 */
export const submitReturnShipmentSchema = z.object({
  returnCarrier: z
    .string()
    .trim()
    .min(1, { message: 'Carrier name is required' })
    .max(100),
  returnTrackingNumber: z
    .string()
    .trim()
    .min(1, { message: 'Tracking number is required' })
    .max(100),
  returnShippingFee: z
    .number()
    .min(0, { message: 'Shipping fee must be 0 or greater' })
    .optional(),
  returnShippingReceiptUrl: z
    .string()
    .trim()
    .url({ message: 'Invalid receipt URL format' })
    .optional()
    .or(z.literal('')),
});

export type SubmitReturnShipmentInput = z.infer<
  typeof submitReturnShipmentSchema
>;
