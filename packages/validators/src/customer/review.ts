import { z } from 'zod';

export const createReviewSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars'),
  title: z
    .string()
    .trim()
    .max(150, 'Title cannot exceed 150 characters')
    .optional()
    .nullable(),
  reviewText: z
    .string()
    .trim()
    .min(10, 'Review must be at least 10 characters')
    .max(1000, 'Review cannot exceed 1000 characters')
    .optional()
    .nullable(),
});

export const reviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  rating: z.coerce.number().int().min(1).max(5).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type ReviewQueryInput = z.infer<typeof reviewQuerySchema>;
