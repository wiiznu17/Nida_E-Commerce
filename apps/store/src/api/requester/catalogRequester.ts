import { apiClient } from '../client';
import type {
  ApiCategory,
  ApiProduct,
  ApiProductDetail,
  ApiColorSwatch,
  ApiProductImage,
  ApiProductVariant,
  StorefrontProduct,
  StoreQueryProductsParams,
} from '@repo/types';

/**
 * Maps an API product (list-level) to unified StorefrontProduct.
 */
export function mapApiProductToStorefront(
  item: ApiProduct | ApiProductDetail | Record<string, unknown>,
): StorefrontProduct {
  const p = item as Record<string, unknown>;

  const rawImages = Array.isArray(p.images)
    ? (p.images as ApiProductImage[])
    : [];

  const primaryImg =
    typeof p.primaryImage === 'string'
      ? p.primaryImage
      : (rawImages.find((img) => img.isPrimary)?.imageUrl ??
        rawImages[0]?.imageUrl ??
        '');

  const secondaryImg =
    typeof p.secondaryImage === 'string'
      ? p.secondaryImage
      : rawImages.length > 1
        ? rawImages[1]?.imageUrl
        : undefined;

  const rawColors = Array.isArray(p.colors) ? p.colors : [];
  const colorSwatches: ApiColorSwatch[] = rawColors.filter(
    (c): c is ApiColorSwatch =>
      typeof c === 'object' && c !== null && 'hex' in c,
  );
  const colorHexes: string[] = rawColors.map((c) =>
    typeof c === 'string' ? c : ((c as ApiColorSwatch)?.hex ?? ''),
  );

  const rawVariants = Array.isArray(p.variants)
    ? (p.variants as ApiProductVariant[])
    : undefined;

  const categoryObj =
    typeof p.category === 'object' && p.category !== null
      ? (p.category as Record<string, unknown>)
      : undefined;

  const inStock =
    typeof p.inStock === 'boolean'
      ? p.inStock
      : rawVariants
        ? rawVariants.some((v) => v.quantityAvailable > 0)
        : true;

  return {
    id: String(p.slug ?? p.id ?? ''),
    slug: String(p.slug ?? ''),
    name: String(p.name ?? ''),
    nameTh: typeof p.nameTh === 'string' ? p.nameTh : undefined,
    price: Number(p.basePrice ?? p.price ?? 0),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
    image: primaryImg,
    secondaryImage: secondaryImg,
    department: String(
      p.department ?? categoryObj?.department ?? '',
    ).toLowerCase(),
    category: String(p.categorySlug ?? categoryObj?.slug ?? 'apparel'),
    subCategory:
      typeof p.categoryName === 'string'
        ? p.categoryName
        : typeof categoryObj?.name === 'string'
          ? (categoryObj.name as string)
          : undefined,
    subCategoryTh:
      typeof p.categoryNameTh === 'string'
        ? p.categoryNameTh
        : typeof categoryObj?.nameTh === 'string'
          ? (categoryObj.nameTh as string)
          : undefined,
    tag: typeof p.tag === 'string' ? p.tag : undefined,
    tagTh: typeof p.tagTh === 'string' ? p.tagTh : undefined,
    description: typeof p.description === 'string' ? p.description : undefined,
    descriptionTh:
      typeof p.descriptionTh === 'string' ? p.descriptionTh : undefined,
    materialsCare:
      typeof p.materialsCare === 'string' ? p.materialsCare : undefined,
    materialsCareTh:
      typeof p.materialsCareTh === 'string' ? p.materialsCareTh : undefined,
    colors: colorHexes,
    colorSwatches: colorSwatches.length > 0 ? colorSwatches : undefined,
    images: rawImages.length > 0 ? rawImages : undefined,
    variants: rawVariants,
    rating: typeof p.rating === 'number' ? p.rating : undefined,
    reviewsCount: typeof p.reviewsCount === 'number' ? p.reviewsCount : 0,
    inStock,
    isPreorder: Boolean(p.isPreorder),
    preorderReleaseDate:
      typeof p.preorderReleaseDate === 'string'
        ? p.preorderReleaseDate
        : undefined,
    preorderLimit:
      typeof p.preorderLimit === 'number' ? p.preorderLimit : undefined,
    preorderDepositAmount: p.preorderDepositAmount
      ? Number(p.preorderDepositAmount)
      : undefined,
  };
}

export interface CatalogProductsResult {
  products: StorefrontProduct[];
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

      const body = await apiClient.get<Record<string, unknown>>(
        '/catalog/products',
        queryParams,
      );

      const rawData = body.data ?? body;
      const itemsList = Array.isArray(rawData)
        ? rawData
        : Array.isArray((rawData as Record<string, unknown>)?.items)
          ? ((rawData as Record<string, unknown>).items as unknown[])
          : null;

      if (!itemsList) {
        return { products: [], total: 0, page: 1, totalPages: 1 };
      }

      const products = itemsList.map((item) =>
        mapApiProductToStorefront(item as Record<string, unknown>),
      );

      const pagination = (body.pagination ?? {}) as Record<string, unknown>;
      const total =
        typeof pagination.total === 'number'
          ? pagination.total
          : products.length;
      const page = typeof pagination.page === 'number' ? pagination.page : 1;
      const totalPages =
        typeof pagination.totalPages === 'number'
          ? pagination.totalPages
          : 1;

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
  ): Promise<StorefrontProduct[]> => {
    const result = await catalogRequester.getProductsWithMeta(params);
    return result.products;
  },

  /**
   * Fetch single product by UUID or slug identifier.
   */
  getProductByIdOrSlug: async (
    idOrSlug: string,
  ): Promise<StorefrontProduct | null> => {
    try {
      const data = await apiClient.get<Record<string, unknown>>(
        `/catalog/products/${encodeURIComponent(idOrSlug)}`,
      );

      if (!data) return null;
      return mapApiProductToStorefront(data);
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
