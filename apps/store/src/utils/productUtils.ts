import type { ApiProduct, ApiProductDetail } from '@repo/types';

/**
 * Checks whether a product only has a single "One Size" option
 * (e.g. bags, accessories, wallets, home living, or explicitly single-size variants).
 */
export function isOneSizeProduct(
  product: ApiProduct | ApiProductDetail | null | undefined,
): boolean {
  if (!product) return true;

  // 1. Explicit variants array (ApiProductDetail)
  if (
    'variants' in product &&
    Array.isArray(product.variants) &&
    product.variants.length > 0
  ) {
    const uniqueSizes = Array.from(
      new Set(product.variants.map((v) => v.size).filter(Boolean)),
    );
    if (uniqueSizes.length === 1 && uniqueSizes[0]?.toLowerCase() === 'one size') {
      return true;
    }
    if (
      uniqueSizes.length > 0 &&
      !uniqueSizes.some((s) => s.toLowerCase() !== 'one size')
    ) {
      return true;
    }
  }

  // 2. Explicit sizes array (ApiProduct)
  if ('sizes' in product && Array.isArray(product.sizes) && product.sizes.length > 0) {
    if (product.sizes.length === 1 && product.sizes[0]?.toLowerCase() === 'one size') {
      return true;
    }
    if (!product.sizes.some((s) => s.toLowerCase() !== 'one size')) {
      return true;
    }
  }

  // 3. Department check
  const dept = (product.department ?? '').toLowerCase();
  if (dept === 'bags' || dept === 'home' || dept === 'lifestyle') {
    return true;
  }

  // 4. Category slug or name check
  const catSlug = (
    'categorySlug' in product && typeof product.categorySlug === 'string'
      ? product.categorySlug
      : 'category' in product &&
          typeof product.category === 'object' &&
          product.category !== null &&
          'slug' in product.category
        ? String(product.category.slug)
        : ''
  ).toLowerCase();

  const isOneSizeCategory =
    catSlug.startsWith('bags') ||
    catSlug.startsWith('accessories') ||
    catSlug.startsWith('home') ||
    catSlug.startsWith('lifestyle') ||
    catSlug.includes('bag') ||
    catSlug.includes('wallet') ||
    catSlug.includes('cardholder') ||
    catSlug.includes('tote') ||
    catSlug.includes('duffle') ||
    catSlug.includes('backpack') ||
    catSlug.includes('hat') ||
    catSlug.includes('cap') ||
    catSlug.includes('belt') ||
    catSlug.includes('scarf') ||
    catSlug.includes('bedding') ||
    catSlug.includes('bath') ||
    catSlug.includes('decor') ||
    catSlug.includes('fragrance');

  return isOneSizeCategory;
}

/**
 * Resolves available sizes for a given product:
 * - Uses real variants/sizes if present
 * - Returns ['One Size'] for accessories/bags/home
 * - Falls back to standard shoe or apparel sizes
 */
export function getProductSizes(
  product: ApiProduct | ApiProductDetail | null | undefined,
): string[] {
  if (!product) return ['One Size'];

  // 1. From variants (ApiProductDetail)
  if (
    'variants' in product &&
    Array.isArray(product.variants) &&
    product.variants.length > 0
  ) {
    const uniqueSizes = Array.from(
      new Set(product.variants.map((v) => v.size).filter(Boolean)),
    );
    if (uniqueSizes.length > 0) {
      return uniqueSizes;
    }
  }

  // 2. From sizes array (ApiProduct)
  if ('sizes' in product && Array.isArray(product.sizes) && product.sizes.length > 0) {
    return product.sizes;
  }

  // 3. One size detection
  if (isOneSizeProduct(product)) {
    return ['One Size'];
  }

  // 4. Footwear / Shoes
  const dept = (product.department ?? '').toLowerCase();
  const catSlug = (
    'categorySlug' in product && typeof product.categorySlug === 'string'
      ? product.categorySlug
      : ''
  ).toLowerCase();

  if (dept === 'shoes' || catSlug.startsWith('shoes')) {
    return ['US 8', 'US 8.5', 'US 9', 'US 9.5', 'US 10', 'US 11'];
  }

  // 5. Kids apparel
  if (dept === 'kids' || catSlug.startsWith('kids')) {
    return ['2Y', '4Y', '6Y', '8Y', '10Y'];
  }

  // 6. Standard apparel
  return ['XS', 'S', 'M', 'L', 'XL'];
}
