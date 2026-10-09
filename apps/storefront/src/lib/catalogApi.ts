import { products as fallbackProducts, type Product } from '@/data/products';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export function mapApiProductToStorefront(item: any): Product {
  return {
    id: item.slug || item.id,
    slug: item.slug,
    name: item.name,
    nameTh: item.nameTh,
    price: Number(item.basePrice ?? item.price ?? 0),
    originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
    image: item.primaryImage || item.image || item.images?.[0]?.imageUrl || '',
    secondaryImage: item.secondaryImage || item.images?.[1]?.imageUrl || undefined,
    category: item.categorySlug || item.category?.slug || 'apparel',
    department: (item.department || item.category?.department || '').toLowerCase(),
    subCategory: item.categoryName || item.category?.name || item.subCategory,
    subCategoryTh: item.categoryNameTh || item.category?.nameTh || item.subCategoryTh,
    tag: item.tag,
    tagTh: item.tagTh,
    description: item.description,
    descriptionTh: item.descriptionTh,
    materialsCare: item.materialsCare,
    materialsCareTh: item.materialsCareTh,
    colors: Array.isArray(item.colors)
      ? item.colors.map((c: any) => (typeof c === 'string' ? c : c.hex))
      : [],
    rating: 4.9,
    reviewsCount: item.reviewsCount ?? 0,
    isPreorder: Boolean(item.isPreorder),
    preorderReleaseDate: item.preorderReleaseDate,
    preorderLimit: item.preorderLimit,
    preorderDepositAmount: item.preorderDepositAmount
      ? Number(item.preorderDepositAmount)
      : undefined,
  };
}

export async function fetchCatalogProducts(params?: {
  department?: string;
  category?: string;
  search?: string;
  limit?: number;
}): Promise<Product[]> {
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
    searchParams.set('limit', String(params?.limit || 50));

    const res = await fetch(`${API_BASE_URL}/catalog/products?${searchParams.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    if (!json.data || !Array.isArray(json.data)) throw new Error('Invalid response structure');

    return json.data.map(mapApiProductToStorefront);
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
