// ====================================================
// @repo/types — Customer Catalog Types (Storefront)
// ====================================================

import type { Department } from '../common/enums.js';
import type { MarketingTag } from '../common/taxonomy.js';

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
  tag?: MarketingTag | string;
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
  subCategory?: string;
  search?: string;
  tag?: string;
  isPreorder?: boolean;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sortBy?: 'featured' | 'newest' | 'price_asc' | 'price-asc' | 'price_desc' | 'price-desc';
  page?: number;
  limit?: number;
}

/**
 * @deprecated Use ApiProduct or ApiProductDetail directly.
 */
export type StorefrontProduct = ApiProduct;
