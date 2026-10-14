import { z } from 'zod';

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
