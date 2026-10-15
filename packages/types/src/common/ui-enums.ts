// ====================================================
// @repo/types — Application & UI Enums (Non-Prisma)
// ====================================================
// Enums and query options used in UI, API queries, and storage
// that do not have a dedicated enum in Prisma schema.

// --- Media & Storage ---
export const UploadFolder = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  BANNERS: 'banners',
  AVATARS: 'avatars',
  REVIEWS: 'reviews',
  SLIPS: 'slips',
  TEMP: 'temp',
} as const;
export type UploadFolder = (typeof UploadFolder)[keyof typeof UploadFolder];
