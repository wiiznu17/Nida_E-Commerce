import { apiClient } from '../client';
import type {
  ApiCategory,
  ApiProduct,
  ApiProductDetail,
  StoreQueryProductsParams,
} from '@repo/types';

export interface CatalogProductsResult {
  products: ApiProduct[];
  total: number;
  page: number;
  totalPages: number;
}

export const catalogRequester = {
  /**
   * Fetch catalog products with pagination and filters metadata.
   */
  getProductsWithMeta: async (
    params?: StoreQueryProductsParams,
  ): Promise<CatalogProductsResult> => {
    try {
      const queryParams: Record<string, string | number | boolean | undefined> = {
        limit: params?.limit ?? 50,
      };

      if (params?.department && params.department !== 'all') {
        queryParams.department = params.department.toUpperCase();
      }
      if (params?.category && params.category !== 'all') {
        queryParams.category = params.category;
      }
      if (params?.subCategory) {
        queryParams.subCategory = params.subCategory;
      }
      if (params?.search) {
        queryParams.search = params.search;
      }
      if (params?.tag) {
        queryParams.tag = params.tag;
      }
      if (params?.minPrice !== undefined) {
        queryParams.minPrice = params.minPrice;
      }
      if (params?.maxPrice !== undefined) {
        queryParams.maxPrice = params.maxPrice;
      }
      if (params?.colors && params.colors.length > 0) {
        queryParams.colors = params.colors.join(',');
      }
      if (params?.isPreorder !== undefined) {
        queryParams.isPreorder = params.isPreorder;
      }
      if (params?.sortBy) {
        queryParams.sortBy = params.sortBy;
      }
      if (params?.page) {
        queryParams.page = params.page;
      }

      const body = await apiClient.get<
        | { items: ApiProduct[]; total: number; page: number; totalPages: number }
        | ApiProduct[]
      >('/catalog/products', queryParams);

      if (Array.isArray(body)) {
        return { products: body, total: body.length, page: 1, totalPages: 1 };
      }

      const products = Array.isArray(body?.items) ? body.items : [];
      const total =
        typeof body?.total === 'number' ? body.total : products.length;
      const page = typeof body?.page === 'number' ? body.page : 1;
      const totalPages =
        typeof body?.totalPages === 'number' ? body.totalPages : 1;

      return { products, total, page, totalPages };
    } catch (err) {
      console.warn('[catalogRequester] getProductsWithMeta error:', err);
      return { products: [], total: 0, page: 1, totalPages: 1 };
    }
  },

  /**
   * Fetch flat list of catalog products.
   */
  getProducts: async (
    params?: StoreQueryProductsParams,
  ): Promise<ApiProduct[]> => {
    const result = await catalogRequester.getProductsWithMeta(params);
    return result.products;
  },

  /**
   * Fetch single product detail by UUID or slug identifier.
   */
  getProductByIdOrSlug: async (
    idOrSlug: string,
  ): Promise<ApiProductDetail | null> => {
    try {
      const data = await apiClient.get<ApiProductDetail>(
        `/catalog/products/${encodeURIComponent(idOrSlug)}`,
      );

      return data ?? null;
    } catch (err) {
      console.warn('[catalogRequester] getProductByIdOrSlug error:', err);
      return null;
    }
  },

  /**
   * Fetch catalog categories for navigation and filter sidebar.
   */
  getCategories: async (department?: string): Promise<ApiCategory[]> => {
    try {
      const params =
        department && department !== 'all'
          ? { department: department.toUpperCase() }
          : undefined;

      const data = await apiClient.get<ApiCategory[]>(
        '/catalog/categories',
        params,
      );

      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('[catalogRequester] getCategories error:', err);
      return [];
    }
  },
};
