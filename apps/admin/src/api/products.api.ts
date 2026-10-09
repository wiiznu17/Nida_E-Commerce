/**
 * Products Requester for Nida Admin
 *
 * Dedicated requester functions for catalog & product management.
 */
import { apiClient } from './client';
import type { Product } from '../data/products';
import type { SkuVariant } from '../data/adminData';

export interface CreateProductPayload extends Omit<Product, 'id'> {
  skus?: SkuVariant[];
}

export interface UpdateProductPayload extends Partial<Product> {
  skus?: SkuVariant[];
}

export const productsApi = {
  /**
   * Fetch all products from catalog.
   */
  async getAll(): Promise<Product[]> {
    return apiClient.get<Product[]>('/catalog/products');
  },

  /**
   * Fetch a single product by its unique ID.
   */
  async getById(id: string): Promise<Product> {
    return apiClient.get<Product>(`/catalog/products/${id}`);
  },

  /**
   * Create a new product with optional SKU variant matrix.
   */
  async create(data: Omit<Product, 'id'>, skus?: SkuVariant[]): Promise<Product> {
    const payload: CreateProductPayload = {
      ...data,
      skus,
    };
    return apiClient.post<Product>('/catalog/products', payload);
  },

  /**
   * Update an existing product and its SKU variant matrix.
   */
  async update(id: string, data: Partial<Product>, skus?: SkuVariant[]): Promise<Product> {
    const payload: UpdateProductPayload = {
      ...data,
      skus,
    };
    return apiClient.put<Product>(`/catalog/products/${id}`, payload);
  },

  /**
   * Toggle product active/published status.
   */
  async toggleStatus(id: string, isActive: boolean): Promise<{ success: boolean; id: string; isActive: boolean }> {
    return apiClient.patch(`/catalog/products/${id}/status`, { isActive });
  },

  /**
   * Delete a product by its ID.
   */
  async delete(id: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/catalog/products/${id}`);
  },
};

