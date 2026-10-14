import { apiClient } from '../client';
import type {
  ApiProduct,
  ApiProductDetail,
  ApiCategory,
  PaginatedResponse,
  ProductSkuVariant,
} from '@repo/types';
import type { QueryProductsInput, CreateProductInput, CreateCategoryInput, UpdateCategoryInput } from '@repo/validators';

export const productRequester = {
  async getAll(): Promise<ApiProduct[]> {
    const res = await this.getProducts({ limit: 100, page: 1, sortBy: 'newest' });
    return Array.isArray(res) ? (res as ApiProduct[]) : (res?.data ?? []);
  },

  async getProducts(params?: Partial<QueryProductsInput>): Promise<PaginatedResponse<ApiProduct>> {
    const data = await apiClient.get<PaginatedResponse<ApiProduct>>(
      '/catalog/products',
      params as Record<string, string | number | boolean | undefined>,
    );
    return data;
  },

  async getStatusCounts(): Promise<{ total: number; published: number; draft: number }> {
    const data = await apiClient.get<{ total: number; published: number; draft: number }>(
      '/catalog/products/counts',
    );
    return data;
  },

  async getCategories(department?: string, includeInactive = false): Promise<ApiCategory[]> {
    const params: Record<string, string | boolean | undefined> = {};
    if (department) params.department = department;
    if (includeInactive) params.includeInactive = true;
    const data = await apiClient.get<ApiCategory[]>(
      '/catalog/categories',
      params as Record<string, string | number | boolean | undefined>,
    );
    return data;
  },

  async createCategory(data: CreateCategoryInput): Promise<ApiCategory> {
    return apiClient.post<ApiCategory>('/catalog/categories', data);
  },

  async updateCategory(id: string, data: UpdateCategoryInput): Promise<ApiCategory> {
    return apiClient.patch<ApiCategory>(`/catalog/categories/${id}`, data);
  },

  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/catalog/categories/${id}`);
  },

  async getBySlug(slugOrId: string): Promise<ApiProductDetail> {
    const data = await apiClient.get<ApiProductDetail>(`/catalog/products/${slugOrId}`);
    return data;
  },

  async create(data: CreateProductInput, skus?: ProductSkuVariant[]): Promise<ApiProductDetail> {
    const payload = {
      ...data,
      skus,
    };
    const response = await apiClient.post<ApiProductDetail>('/catalog/products', payload);
    return response;
  },

  async update(id: string, data: Partial<CreateProductInput>, skus?: ProductSkuVariant[]): Promise<ApiProductDetail> {
    const payload = {
      ...data,
      ...(skus ? { skus } : {}),
    };
    const response = await apiClient.put<ApiProductDetail>(`/catalog/products/${id}`, payload);
    return response;
  },

  async toggleStatus(
    id: string,
    isActive: boolean,
  ): Promise<{ success: boolean; id: string; isActive: boolean }> {
    const data = await apiClient.patch<{ success: boolean; id: string; isActive: boolean }>(
      `/catalog/products/${id}/status`,
      { isActive },
    );
    return data;
  },

  async delete(id: string): Promise<{ success: boolean; id: string }> {
    const data = await apiClient.delete<{ success: boolean; id: string }>(
      `/catalog/products/${id}`,
    );
    return data;
  },
};

export const productsApi = productRequester;
