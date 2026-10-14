import { z } from 'zod';
import { Department } from '@repo/types';

const departmentValues = Object.values(Department) as [string, ...string[]];

/**
 * Category Creation Schema
 */
export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name (EN) is required').max(100),
  nameTh: z.string().trim().max(100).optional().nullable(),
  slug: z.string().trim().max(120).optional().nullable(),
  department: z.enum(departmentValues, {
    error: 'Valid department is required',
  }),
  parentId: z
    .string()
    .uuid('Parent category ID must be a valid UUID')
    .optional()
    .nullable(),
  description: z.string().trim().optional().nullable(),
  descriptionTh: z.string().trim().optional().nullable(),
  bannerTag: z.string().trim().max(100).optional().nullable(),
  bannerTagTh: z.string().trim().max(100).optional().nullable(),
  bannerImage: z.string().trim().max(500).optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

/**
 * Category Update Schema
 */
export const updateCategorySchema = createCategorySchema.partial();

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
