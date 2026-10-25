import { z } from 'zod';

export const validateCouponSchema = z.object({
  code: z.string().trim().min(1, { message: 'Coupon code is required' }),
  orderAmount: z
    .number()
    .min(0, { message: 'Order amount cannot be negative' }),
  userId: z.string().uuid({ message: 'Invalid user ID format' }).optional(),
});

export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;

export const checkoutItemInputSchema = z.object({
  variantId: z.string().uuid({ message: 'Invalid variant ID format' }),
  quantity: z.number().int().min(1, { message: 'Quantity must be at least 1' }),
});

export type CheckoutItemInput = z.infer<typeof checkoutItemInputSchema>;

export const calculateCheckoutSchema = z.object({
  items: z
    .array(checkoutItemInputSchema)
    .min(1, { message: 'Items cannot be empty' }),
  couponCode: z.string().trim().optional(),
  userId: z.string().uuid({ message: 'Invalid user ID format' }).optional(),
});

export type CalculateCheckoutInput = z.infer<typeof calculateCheckoutSchema>;
