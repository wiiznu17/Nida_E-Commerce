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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

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

export async function fetchCatalogProductsWithMeta(
  params?: StoreQueryProductsParams,
): Promise<CatalogProductsResult> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.department && params.department !== 'all') {
      searchParams.set('department', params.department.toUpperCase());
    }
    if (params?.category && params.category !== 'all') {
      searchParams.set('category', params.category);
    }
    if (params?.subCategory) {
      searchParams.set('subCategory', params.subCategory);
    }
    if (params?.search) {
      searchParams.set('search', params.search);
    }
    if (params?.tag) {
      searchParams.set('tag', params.tag);
    }
    if (params?.minPrice !== undefined) {
      searchParams.set('minPrice', String(params.minPrice));
    }
    if (params?.maxPrice !== undefined) {
      searchParams.set('maxPrice', String(params.maxPrice));
    }
    if (params?.colors && params.colors.length > 0) {
      searchParams.set('colors', params.colors.join(','));
    }
    if (params?.isPreorder !== undefined) {
      searchParams.set('isPreorder', String(params.isPreorder));
    }
    if (params?.sortBy) {
      searchParams.set('sortBy', params.sortBy);
    }
    if (params?.page) {
      searchParams.set('page', String(params.page));
    }
    searchParams.set('limit', String(params?.limit ?? 50));

    const res = await fetch(
      `${API_BASE_URL}/catalog/products?${searchParams.toString()}`,
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json: unknown = await res.json();
    const body = json as Record<string, unknown>;
    const rawData = body.data ?? body;
    const itemsList = Array.isArray(rawData)
      ? rawData
      : Array.isArray((rawData as Record<string, unknown>)?.items)
        ? ((rawData as Record<string, unknown>).items as unknown[])
        : null;

    if (!itemsList) throw new Error('Invalid response structure');

    const products = itemsList.map((item) =>
      mapApiProductToStorefront(item as Record<string, unknown>),
    );

    const pagination = (body.pagination ?? {}) as Record<string, unknown>;
    const total = typeof pagination.total === 'number' ? pagination.total : products.length;
    const page = typeof pagination.page === 'number' ? pagination.page : 1;
    const totalPages = typeof pagination.totalPages === 'number' ? pagination.totalPages : 1;

    return { products, total, page, totalPages };
  } catch (err) {
    console.warn('[catalogApi] fetchCatalogProductsWithMeta error:', err);
    return { products: [], total: 0, page: 1, totalPages: 1 };
  }
}

export async function fetchCatalogProducts(
  params?: StoreQueryProductsParams,
): Promise<StorefrontProduct[]> {
  const result = await fetchCatalogProductsWithMeta(params);
  return result.products;
}

export async function fetchProductByIdOrSlug(
  idOrSlug: string,
): Promise<StorefrontProduct | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/catalog/products/${encodeURIComponent(idOrSlug)}`,
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json: unknown = await res.json();
    const body = json as Record<string, unknown>;
    if (!body.data) throw new Error('Product not found in API response');
    return mapApiProductToStorefront(body.data as Record<string, unknown>);
  } catch (err) {
    console.warn('[catalogApi] fetchProductByIdOrSlug error:', err);
    return null;
  }
}

export async function fetchCatalogCategories(
  department?: string,
): Promise<ApiCategory[]> {
  try {
    const url =
      department && department !== 'all'
        ? `${API_BASE_URL}/catalog/categories?department=${encodeURIComponent(department.toUpperCase())}`
        : `${API_BASE_URL}/catalog/categories`;

    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json: unknown = await res.json();
    const body = json as Record<string, unknown>;
    const data = body.data ?? body;
    if (!Array.isArray(data)) throw new Error('Invalid categories response');

    return data as ApiCategory[];
  } catch (err) {
    console.warn('[catalogApi] fetchCatalogCategories error:', err);
    return [];
  }
}
