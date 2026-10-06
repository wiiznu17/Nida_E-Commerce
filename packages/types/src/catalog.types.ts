// ====================================================
// @repo/types — Catalog Types (สินค้า & หมวดหมู่)
// ====================================================

import type { Department } from './enums.js';

// ----- Categories -----

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  department: Department;
  description?: string;
  bannerTag?: string;
  bannerImage?: string;
  displayOrder: number;
  parentId?: string;
  children?: ApiCategory[];
  productCount?: number;
}

// ----- Product (List Item — สำหรับแสดงในหน้ารวม) -----

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  originalPrice?: number;
  primaryImage?: string;
  secondaryImage?: string;
  department: Department;
  categoryName: string;
  categorySlug: string;
  tag?: string;
  colors: ApiColorSwatch[];
  rating?: number;
  reviewsCount?: number;
  inStock: boolean;
  isPreorder: boolean;
}

export interface ApiColorSwatch {
  name: string;
  hex: string;
}

// ----- Product Detail (หน้า PDP — รายละเอียดสินค้า) -----

export interface ApiProductDetail {
  id: string;
  name: string;
  slug: string;
  description?: string;
  materialsCare?: string;
  basePrice: number;
  originalPrice?: number;
  tag?: string;
  department: Department;
  category: ApiCategory;
  images: ApiProductImage[];
  variants: ApiProductVariant[];
  rating?: number;
  reviewsCount?: number;

  // Pre-order info
  isPreorder: boolean;
  preorderReleaseDate?: string;
  preorderLimit?: number;
  preorderDepositAmount?: number;
}

export interface ApiProductImage {
  id: string;
  imageUrl: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface ApiProductVariant {
  id: string;
  sku: string;
  size: string;
  colorName: string;
  colorHex: string;
  price: number;
  compareAtPrice?: number;
  inStock: boolean;
  quantityAvailable: number;

  // Shipping dimensions
  weightGrams: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}
