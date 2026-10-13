import { apiClient } from '../client';
import type { Product } from '../../data/products';
import type { SkuVariant } from '../../data/adminData';

export interface CreateProductPayload extends Omit<Product, 'id'> {
  skus?: SkuVariant[];
}

export interface UpdateProductPayload extends Partial<Product> {
  skus?: SkuVariant[];
}

interface ApiProductResponse {
  id: string;
  slug?: string;
  basePrice?: number | string;
  price?: number | string;
  originalPrice?: number | string | null;
  images?: Array<{ imageUrl: string; isPrimary?: boolean }>;
  category?: { slug?: string; department?: string };
  isActive?: boolean;
}

function resolvePrimaryImageUrl(
  images: Array<{ imageUrl: string; isPrimary?: boolean }> | undefined,
  fallbackUrl: string,
): string {
  if (!images || images.length === 0) {
    return fallbackUrl;
  }
  const primaryImage = images.find((item) => item.isPrimary);
  if (primaryImage?.imageUrl) {
    return primaryImage.imageUrl;
  }
  return images[0]?.imageUrl ?? fallbackUrl;
}

export const productRequester = {
  async getAll(): Promise<Product[]> {
    const data = await apiClient.get<Product[]>('/catalog/products');
    return data;
  },

  async getById(id: string): Promise<Product> {
    const data = await apiClient.get<Product>(`/catalog/products/${id}`);
    return data;
  },

  async create(data: Omit<Product, 'id'>, skus?: SkuVariant[]): Promise<Product> {
    const payload: CreateProductPayload = {
      ...data,
      skus,
    };
    const response = await apiClient.post<ApiProductResponse>('/catalog/products', payload);
    const resolvedImage = resolvePrimaryImageUrl(response.images, data.image);
    const categorySlug = response.category?.slug ?? data.category;
    const departmentCode = (response.category?.department ?? data.department)?.toLowerCase();

    return {
      ...data,
      id: response.id,
      slug: response.slug,
      price: Number(response.basePrice ?? response.price ?? data.price),
      originalPrice:
        response.originalPrice != null
          ? Number(response.originalPrice)
          : data.originalPrice,
      image: resolvedImage,
      category: categorySlug,
      department: departmentCode,
      isActive: response.isActive ?? data.isActive,
    };
  },

  async update(id: string, data: Partial<Product>, skus?: SkuVariant[]): Promise<Product> {
    const payload: UpdateProductPayload = {
      ...data,
      skus,
    };
    const response = await apiClient.put<Product>(`/catalog/products/${id}`, payload);
    return response;
  },

  async toggleStatus(id: string, nextStatus?: boolean): Promise<{ success: boolean; isActive: boolean }> {
    const data = await apiClient.patch<{ success: boolean; isActive: boolean }>(
      `/catalog/products/${id}/toggle`,
      nextStatus !== undefined ? { isActive: nextStatus } : undefined,
    );
    return data;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const data = await apiClient.delete<{ success: boolean }>(`/catalog/products/${id}`);
    return data;
  },
};

export const productsApi = productRequester;
