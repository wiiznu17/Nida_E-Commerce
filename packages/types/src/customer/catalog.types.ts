// ====================================================
// @repo/types — Customer Catalog Types (Storefront)
// ====================================================

import type { Department } from '../common/enums.js';

export interface ApiCategory {
  id: string;
  name: string;
  nameTh?: string;
  slug: string;
  department: Department;
  description?: string;
  descriptionTh?: string;
  bannerTag?: string;
  bannerTagTh?: string;
  bannerImage?: string;
  displayOrder: number;
  parentId?: string;
  children?: ApiCategory[];
  productCount?: number;
  isActive?: boolean;
}

export interface ApiProduct {
  id: string;
  name: string;
  nameTh?: string;
  slug: string;
  basePrice: number;
  originalPrice?: number;
  primaryImage?: string;
  secondaryImage?: string;
  department: Department;
  categoryName: string;
  categoryNameTh?: string;
  categorySlug: string;
  tag?: string;
  tagTh?: string;
  colors: ApiColorSwatch[];
  rating?: number;
  reviewsCount?: number;
  inStock: boolean;
  isPreorder: boolean;
  isActive?: boolean;
}

export interface ApiColorSwatch {
  name: string;
  nameTh?: string;
  hex: string;
}

export interface ApiProductDetail {
  id: string;
  name: string;
  nameTh?: string;
  slug: string;
  description?: string;
  descriptionTh?: string;
  materialsCare?: string;
  materialsCareTh?: string;
  basePrice: number;
  originalPrice?: number;
  tag?: string;
  tagTh?: string;
  department: Department;
  category: ApiCategory;
  images: ApiProductImage[];
  variants: ApiProductVariant[];
  rating?: number;
  reviewsCount?: number;

  isPreorder: boolean;
  preorderReleaseDate?: string;
  preorderLimit?: number;
  preorderDepositAmount?: number;
  isActive?: boolean;
}

export interface ApiProductImage {
  id: string;
  imageUrl: string;
  altText?: string;
  altTextTh?: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface ApiProductVariant {
  id: string;
  sku: string;
  size: string;
  colorName: string;
  colorNameTh?: string;
  colorHex: string;
  price: number;
  compareAtPrice?: number;
  inStock: boolean;
  quantityAvailable: number;

  weightGrams: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}

export interface StoreQueryProductsParams {
  department?: string;
  category?: string;
  search?: string;
  tag?: string;
  isPreorder?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
}

/**
 * Unified Storefront Product display type.
 * Used across all store pages: Homepage, Collection, PDP, Cart, Search.
 * Replaces the old local Product type from apps/store/src/data/products.ts
 */
export interface StorefrontProduct {
  id: string;
  slug: string;
  name: string;
  nameTh?: string;
  price: number;
  originalPrice?: number;
  image: string;
  secondaryImage?: string;
  department: string;
  category: string;
  subCategory?: string;
  subCategoryTh?: string;
  tag?: string;
  tagTh?: string;
  description?: string;
  descriptionTh?: string;
  materialsCare?: string;
  materialsCareTh?: string;
  colors: string[];
  colorSwatches?: ApiColorSwatch[];
  images?: ApiProductImage[];
  variants?: ApiProductVariant[];
  rating?: number;
  reviewsCount?: number;
  inStock?: boolean;
  isPreorder?: boolean;
  preorderReleaseDate?: string;
  preorderLimit?: number;
  preorderDepositAmount?: number;
}
