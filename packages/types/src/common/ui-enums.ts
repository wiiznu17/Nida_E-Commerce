// ====================================================
// @repo/types — Application & UI Enums (Non-Prisma)
// ====================================================
// Enums and query options used in UI, API queries, and storage
// that do not have a dedicated enum in Prisma schema.

// --- Query & Filtering ---
export const SortBy = {
  NEWEST: 'newest',
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  BESTSELLER: 'bestseller',
  RATING: 'rating',
} as const;
export type SortBy = (typeof SortBy)[keyof typeof SortBy];

// --- Marketing & Product Badges ---
export const ProductTag = {
  BESTSELLER: 'BESTSELLER',
  NEW_ARRIVAL: 'NEW ARRIVAL',
  SALE: 'SALE',
  LIMITED_EDITION: 'LIMITED EDITION',
  EXCLUSIVE: 'EXCLUSIVE',
  PRE_ORDER: 'PRE-ORDER',
} as const;
export type ProductTag = (typeof ProductTag)[keyof typeof ProductTag];

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
