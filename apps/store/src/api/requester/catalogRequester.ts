import { apiClient } from '../client';
import type {
  ApiCategory,
  ApiProduct,
  ApiProductDetail,
  PaginatedResponse,
  PaginationMeta,
  StoreQueryProductsParams,
  SyncCartResponse,
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
      const queryParams: Record<string, string | number | boolean | undefined> =
        {
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
        | PaginatedResponse<ApiProduct>
        | { data: ApiProduct[]; pagination?: PaginationMeta }
        | {
            items: ApiProduct[];
            total?: number;
            page?: number;
            totalPages?: number;
          }
        | ApiProduct[]
      >('/catalog/products', queryParams);

      if (Array.isArray(body)) {
        return { products: body, total: body.length, page: 1, totalPages: 1 };
      }

      if (body && typeof body === 'object') {
        const rawObj = body as Record<string, unknown>;
        let products: ApiProduct[] = [];
        if (Array.isArray(rawObj.data)) {
          products = rawObj.data as ApiProduct[];
        } else if (Array.isArray(rawObj.items)) {
          products = rawObj.items as ApiProduct[];
        }

        const pagination =
          rawObj.pagination && typeof rawObj.pagination === 'object'
            ? (rawObj.pagination as Record<string, unknown>)
            : null;

        const total =
          typeof pagination?.total === 'number'
            ? pagination.total
            : typeof rawObj.total === 'number'
              ? rawObj.total
              : products.length;

        const page =
          typeof pagination?.page === 'number'
            ? pagination.page
            : typeof rawObj.page === 'number'
              ? rawObj.page
              : 1;

        const totalPages =
          typeof pagination?.totalPages === 'number'
            ? pagination.totalPages
            : typeof rawObj.totalPages === 'number'
              ? rawObj.totalPages
              : 1;

        return { products, total, page, totalPages };
      }

      return { products: [], total: 0, page: 1, totalPages: 1 };
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

  /**
   * Sync latest prices and stock availability for cart items.
   */
  syncCart: async (variantIds: string[]): Promise<SyncCartResponse> => {
    try {
      const data = await apiClient.post<SyncCartResponse>('/catalog/sync-cart', {
        variantIds,
      });
      return data ?? { items: [] };
    } catch (err) {
      console.warn('[catalogRequester] syncCart error:', err);
      return { items: [] };
    }
  },
};
