import { z } from 'zod';

export const mergeCartItemSchema = z.object({
  variantId: z.string().uuid('variantId must be a valid UUID'),
  quantity: z
    .number()
    .int('quantity must be an integer')
    .min(1, 'quantity must be at least 1')
    .max(99, 'quantity cannot exceed 99'),
});

export const mergeCartSchema = z.object({
  items: z.array(mergeCartItemSchema).max(50, 'Cannot merge more than 50 items'),
});

export type MergeCartInput = z.infer<typeof mergeCartSchema>;

export const updateCartItemSchema = z.object({
  variantId: z.string().uuid('variantId must be a valid UUID'),
  quantity: z
    .number()
    .int('quantity must be an integer')
    .min(0, 'quantity cannot be negative')
    .max(99, 'quantity cannot exceed 99'),
});

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
