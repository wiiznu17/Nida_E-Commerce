import type {
  ApiCategory,
  ApiProduct,
  ApiProductDetail,
  StoreQueryProductsParams,
} from '@repo/types';
import { products as fallbackProducts, type Product } from '@/data/products';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

export function mapApiProductToStorefront(
  item: ApiProduct | ApiProductDetail | Record<string, unknown>,
): Product {
  const p = item as Record<string, unknown>;
  const images = Array.isArray(p.images) ? (p.images as { imageUrl: string }[]) : [];
  const primaryImg =
    typeof p.primaryImage === 'string'
      ? p.primaryImage
      : typeof p.image === 'string'
        ? p.image
        : images[0]?.imageUrl || '';

  const secondaryImg =
    typeof p.secondaryImage === 'string'
      ? p.secondaryImage
      : images[1]?.imageUrl || undefined;

  const rawColors = Array.isArray(p.colors) ? p.colors : [];
  const colors = rawColors.map((c) =>
    typeof c === 'string' ? c : (c as { hex?: string })?.hex || '',
  );

  return {
    id: String(p.slug || p.id || ''),
    slug: String(p.slug || ''),
    name: String(p.name || ''),
    nameTh: typeof p.nameTh === 'string' ? p.nameTh : undefined,
    price: Number(p.basePrice ?? p.price ?? 0),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
    image: primaryImg,
    secondaryImage: secondaryImg,
    category: String(p.categorySlug || (p.category as { slug?: string })?.slug || 'apparel'),
    department: String(p.department || (p.category as { department?: string })?.department || '').toLowerCase(),
    subCategory:
      typeof p.categoryName === 'string'
        ? p.categoryName
        : typeof (p.category as { name?: string })?.name === 'string'
          ? (p.category as { name: string }).name
          : typeof p.subCategory === 'string'
            ? p.subCategory
            : undefined,
    subCategoryTh:
      typeof p.categoryNameTh === 'string'
        ? p.categoryNameTh
        : typeof (p.category as { nameTh?: string })?.nameTh === 'string'
          ? (p.category as { nameTh: string }).nameTh
          : typeof p.subCategoryTh === 'string'
            ? p.subCategoryTh
            : undefined,
    tag: typeof p.tag === 'string' ? p.tag : undefined,
    tagTh: typeof p.tagTh === 'string' ? p.tagTh : undefined,
    description: typeof p.description === 'string' ? p.description : undefined,
    descriptionTh: typeof p.descriptionTh === 'string' ? p.descriptionTh : undefined,
    materialsCare: typeof p.materialsCare === 'string' ? p.materialsCare : undefined,
    materialsCareTh: typeof p.materialsCareTh === 'string' ? p.materialsCareTh : undefined,
    colors,
    rating: typeof p.rating === 'number' ? p.rating : 4.9,
    reviewsCount: typeof p.reviewsCount === 'number' ? p.reviewsCount : 0,
    isPreorder: Boolean(p.isPreorder),
    preorderReleaseDate:
      typeof p.preorderReleaseDate === 'string' ? p.preorderReleaseDate : undefined,
    preorderLimit: typeof p.preorderLimit === 'number' ? p.preorderLimit : undefined,
    preorderDepositAmount: p.preorderDepositAmount
      ? Number(p.preorderDepositAmount)
      : undefined,
  };
}

export async function fetchCatalogProducts(
  params?: StoreQueryProductsParams,
): Promise<Product[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.department && params.department !== 'all') {
      searchParams.set('department', params.department.toUpperCase());
    }
    if (params?.category && params.category !== 'all') {
      searchParams.set('category', params.category);
    }
    if (params?.search) {
      searchParams.set('search', params.search);
    }
    if (params?.tag) {
      searchParams.set('tag', params.tag);
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
    searchParams.set('limit', String(params?.limit || 50));

    const res = await fetch(`${API_BASE_URL}/catalog/products?${searchParams.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    const rawData = json.data ?? json;
    const itemsList = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.items)
        ? rawData.items
        : null;

    if (!itemsList) throw new Error('Invalid response structure');

    return itemsList.map((item: unknown) =>
      mapApiProductToStorefront(item as Record<string, unknown>),
    );
  } catch (err) {
    console.warn('API fetch products error, fallback to seed data:', err);
    return fallbackProducts;
  }
}

export async function fetchProductByIdOrSlug(idOrSlug: string): Promise<Product> {
  try {
    const res = await fetch(`${API_BASE_URL}/catalog/products/${idOrSlug}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    if (!json.data) throw new Error('Product not found in API response');
    return mapApiProductToStorefront(json.data);
  } catch (err) {
    console.warn('API fetch single product error, fallback to seed data:', err);
    const found =
      fallbackProducts.find((p) => p.id === idOrSlug || p.slug === idOrSlug) ||
      fallbackProducts[0]!;
    return found;
  }
}

export async function fetchCatalogCategories(department?: string): Promise<ApiCategory[]> {
  try {
    const url = department && department !== 'all'
      ? `${API_BASE_URL}/catalog/categories?department=${encodeURIComponent(department.toUpperCase())}`
      : `${API_BASE_URL}/catalog/categories`;

    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    const data = json.data ?? json;
    if (!Array.isArray(data)) throw new Error('Invalid categories response');

    return data as ApiCategory[];
  } catch (err) {
    console.warn('API fetch categories error:', err);
    return [];
  }
}
