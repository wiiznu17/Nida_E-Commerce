import { z } from 'zod';

/**
 * SKU Variant Schema
 */
export const createSkuVariantSchema = z.object({
  sku: z.string().trim().min(1, 'SKU code is required'),
  size: z.string().trim().min(1, 'Size is required'),
  colorName: z.string().trim().min(1, 'Color name is required'),
  colorHex: z.string().trim().min(1, 'Color hex code is required'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative').default(0),
  lowStockThreshold: z.coerce.number().int().min(0, 'Low stock threshold cannot be negative').default(5),
  priceAdjustment: z.coerce.number().default(0),
  barcode: z.string().trim().optional().nullable(),
  weightGrams: z.coerce.number().positive('Weight must be positive').optional().nullable(),
});

export type CreateSkuVariantInput = z.infer<typeof createSkuVariantSchema>;

/**
 * Product Creation Schema
 */
export const createProductSchema = z
  .object({
    name: z.string().trim().min(1, 'Product name is required'),
    nameTh: z.string().trim().optional().nullable(),
    price: z.coerce.number().positive('Price must be greater than 0').optional().nullable(),
    basePrice: z.coerce.number().positive('Base price must be greater than 0').optional().nullable(),
    originalPrice: z.coerce.number().positive('Original price must be greater than 0').optional().nullable(),
    image: z.string().trim().min(1, 'Primary cover image is required').optional().nullable(),
    secondaryImage: z.string().trim().optional().nullable(),
    category: z.string().trim().min(1, 'Category is required'),
    department: z.string().trim().optional().nullable(),
    subCategory: z.string().trim().optional().nullable(),
    subCategoryTh: z.string().trim().optional().nullable(),
    tag: z.string().trim().optional().nullable(),
    tagTh: z.string().trim().optional().nullable(),
    description: z.string().trim().optional().nullable(),
    descriptionTh: z.string().trim().optional().nullable(),
    materialsCare: z.string().trim().optional().nullable(),
    materialsCareTh: z.string().trim().optional().nullable(),
    colors: z.array(z.string()).optional().default([]),
    colorImages: z.record(z.string(), z.string()).optional().nullable(),
    isPreorder: z.coerce.boolean().optional().default(false),
    preorderReleaseDate: z.string().optional().nullable(),
    preorderLimit: z.coerce.number().int().min(0).optional().nullable(),
    preorderDepositAmount: z.coerce.number().min(0).optional().nullable(),
    skus: z.array(createSkuVariantSchema).optional().default([]),
    isActive: z.coerce.boolean().optional().default(true),
  })
  .refine(
    (data) => {
      const p = data.price ?? data.basePrice;
      return typeof p === 'number' && p > 0;
    },
    {
      message: 'Either price or basePrice must be provided and greater than 0',
      path: ['price'],
    },
  );

export type CreateProductInput = z.infer<typeof createProductSchema>;

/**
 * Update Product Status Schema
 */
export const updateProductStatusSchema = z.object({
  isActive: z.coerce.boolean(),
});

export type UpdateProductStatusInput = z.infer<typeof updateProductStatusSchema>;

/**
 * Product Query Schema
 */
export const queryProductsSchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  department: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  isPreorder: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => val === true || val === 'true')
    .optional(),
  sortBy: z.enum(['newest', 'price_asc', 'price_desc', 'bestseller']).optional().default('newest'),
  page: z.coerce.number().int().min(1, 'Page must be at least 1').optional().default(1),
  limit: z.coerce.number().int().min(1).max(100, 'Limit cannot exceed 100').optional().default(12),
});

export type QueryProductsInput = z.infer<typeof queryProductsSchema>;
