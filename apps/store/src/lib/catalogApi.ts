/**
 * Catalog API Adapter (Legacy compatibility wrapper)
 *
 * All implementations now route cleanly through the unified @/api layer
 * mirroring apps/admin/src/api.
 */

import {
  catalogRequester,
  type CatalogProductsResult,
} from '@/api';
import type {
  ApiCategory,
  ApiProduct,
  ApiProductDetail,
  StoreQueryProductsParams,
} from '@repo/types';

export { type CatalogProductsResult };

export async function fetchCatalogProductsWithMeta(
  params?: StoreQueryProductsParams,
): Promise<CatalogProductsResult> {
  return catalogRequester.getProductsWithMeta(params);
}

export async function fetchCatalogProducts(
  params?: StoreQueryProductsParams,
): Promise<ApiProduct[]> {
  return catalogRequester.getProducts(params);
}

export async function fetchProductByIdOrSlug(
  idOrSlug: string,
): Promise<ApiProductDetail | null> {
  return catalogRequester.getProductByIdOrSlug(idOrSlug);
}

export async function fetchCatalogCategories(
  department?: string,
): Promise<ApiCategory[]> {
  return catalogRequester.getCategories(department);
}
