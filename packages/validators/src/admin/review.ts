import { z } from 'zod';

export const adminReviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  productId: z.string().uuid().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  status: z.enum(['ALL', 'APPROVED', 'HIDDEN']).default('ALL'),
});

export const adminUpdateReviewStatusSchema = z.object({
  isApproved: z.boolean(),
});

export const adminReplyReviewSchema = z.object({
  adminReply: z
    .string()
    .trim()
    .min(2, 'Reply must be at least 2 characters')
    .max(1000, 'Reply cannot exceed 1000 characters'),
});

export type AdminReviewQueryInput = z.infer<typeof adminReviewQuerySchema>;
export type AdminUpdateReviewStatusInput = z.infer<
  typeof adminUpdateReviewStatusSchema
>;
export type AdminReplyReviewInput = z.infer<typeof adminReplyReviewSchema>;

