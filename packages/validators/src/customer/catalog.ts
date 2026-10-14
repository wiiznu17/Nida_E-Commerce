import { z } from 'zod';

/**
 * Product Query Schema for Catalog Browsing
 */
export const queryProductsSchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  department: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  status: z.enum(['all', 'published', 'draft']).optional(),
  isActive: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => val === true || val === 'true')
    .optional(),
  isPreorder: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => val === true || val === 'true')
    .optional(),
  sortBy: z.enum(['newest', 'price_asc', 'price_desc', 'bestseller']).optional().default('newest'),
  page: z.coerce.number().int().min(1, 'Page must be at least 1').optional().default(1),
  limit: z.coerce.number().int().min(1).max(100, 'Limit cannot exceed 100').optional().default(12),
});

export type QueryProductsInput = z.infer<typeof queryProductsSchema>;
