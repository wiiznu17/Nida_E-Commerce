import { apiClient } from '../client';
import type {
  ApiProduct,
  ApiProductDetail,
  ApiCategory,
  PaginatedResponse,
} from '@repo/types';
import type { QueryProductsInput } from '@repo/validators';
import type { Product } from '../../data/products';
import type { SkuVariant } from '../../data/adminData';

export function mapApiProductDetailToProduct(
  detail: ApiProductDetail,
  fallback: Omit<Product, 'id'>,
): Product {
  const derivedColors = detail.variants
    ? Array.from(new Set(detail.variants.map((v) => v.colorHex)))
    : fallback.colors;

  return {
    ...fallback,
    id: detail.id,
    slug: detail.slug,
    name: detail.name,
    nameTh: detail.nameTh,
    price: detail.basePrice,
    originalPrice: detail.originalPrice,
    image: detail.images?.[0]?.imageUrl ?? fallback.image,
    secondaryImage: detail.images?.[1]?.imageUrl ?? fallback.secondaryImage,
    category: detail.category?.slug ?? fallback.category,
    subCategory: detail.category?.name ?? fallback.subCategory,
    subCategoryTh: detail.category?.nameTh ?? fallback.subCategoryTh,
    department: (detail.category?.department ?? fallback.department)?.toLowerCase(),
    tag: detail.tag,
    tagTh: detail.tagTh,
    description: detail.description,
    descriptionTh: detail.descriptionTh,
    materialsCare: detail.materialsCare,
    materialsCareTh: detail.materialsCareTh,
    colors: derivedColors,
    rating: detail.rating,
    reviewsCount: detail.reviewsCount,
    isPreorder: detail.isPreorder,
    preorderReleaseDate: detail.preorderReleaseDate,
    preorderLimit: detail.preorderLimit,
    preorderDepositAmount: detail.preorderDepositAmount,
    isActive: detail.isActive,
  };
}

export const productRequester = {
  async getAll(): Promise<Product[]> {
    const res = await this.getProducts({ limit: 100, page: 1, sortBy: 'newest' });
    const items = Array.isArray(res) ? (res as ApiProduct[]) : (res?.data ?? []);
    return items.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      nameTh: p.nameTh,
      price: p.basePrice,
      originalPrice: p.originalPrice,
      image: p.primaryImage ?? '',
      secondaryImage: p.secondaryImage,
      category: p.categorySlug,
      subCategory: p.categoryName,
      subCategoryTh: p.categoryNameTh,
      department: p.department?.toLowerCase(),
      tag: p.tag,
      tagTh: p.tagTh,
      colors: p.colors.map((c) => c.hex),
      rating: p.rating ?? 5.0,
      reviewsCount: p.reviewsCount ?? 0,
      isPreorder: p.isPreorder,
      isActive: p.isActive ?? true,
    }));
  },

  async getProducts(params?: Partial<QueryProductsInput>): Promise<PaginatedResponse<ApiProduct>> {
    const data = await apiClient.get<PaginatedResponse<ApiProduct>>(
      '/catalog/products',
      params as Record<string, string | number | boolean | undefined>,
    );
    console.log("data", data);
    return data;
  },

  async getCategories(department?: string): Promise<ApiCategory[]> {
    const data = await apiClient.get<ApiCategory[]>(
      '/catalog/categories',
      department ? { department } : undefined,
    );
    return data;
  },

  async getBySlug(slugOrId: string): Promise<ApiProductDetail> {
    const data = await apiClient.get<ApiProductDetail>(`/catalog/products/${slugOrId}`);
    return data;
  },

  async create(data: Omit<Product, 'id'>, skus?: SkuVariant[]): Promise<Product> {
    const payload = {
      ...data,
      skus,
    };
    const response = await apiClient.post<ApiProductDetail>('/catalog/products', payload);
    return mapApiProductDetailToProduct(response, data);
  },

  async update(id: string, data: Partial<Product>, _skus?: SkuVariant[]): Promise<Product> {
    const response = await apiClient.put<ApiProductDetail>(`/catalog/products/${id}`, data);
    return mapApiProductDetailToProduct(response, {
      name: data.name ?? response.name,
      price: data.price ?? response.basePrice,
      image: data.image ?? response.images?.[0]?.imageUrl ?? '',
      category: data.category ?? response.category?.slug ?? 'apparel',
    });
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
