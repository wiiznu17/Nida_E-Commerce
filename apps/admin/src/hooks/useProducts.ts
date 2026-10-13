import { useState, useEffect, useCallback } from 'react';
import { productRequester } from '../api/requester/productRequester';
import type { ApiProduct } from '@repo/types';
import type { QueryProductsInput } from '@repo/validators';
import type { Product } from '../data/products';

export function mapApiProductToProduct(api: ApiProduct): Product {
  return {
    id: api.id,
    slug: api.slug,
    name: api.name,
    nameTh: api.nameTh,
    price: api.basePrice,
    originalPrice: api.originalPrice,
    image: api.primaryImage ?? '',
    secondaryImage: api.secondaryImage,
    category: api.categorySlug,
    subCategory: api.categoryName,
    subCategoryTh: api.categoryNameTh,
    department: api.department?.toLowerCase(),
    tag: api.tag,
    tagTh: api.tagTh,
    colors: api.colors?.map((c) => c.hex) ?? [],
    rating: api.rating ?? 5.0,
    reviewsCount: api.reviewsCount ?? 0,
    isPreorder: api.isPreorder,
    isActive: api.isActive ?? true,
  };
}

export function useProducts(params: Partial<QueryProductsInput> = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [rawApiProducts, setRawApiProducts] = useState<ApiProduct[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productRequester.getProducts(params);
      if (response && response.data) {
        setRawApiProducts(response.data);
        setProducts(response.data.map(mapApiProductToProduct));
        setTotal(response.pagination.total);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [
    params.page,
    params.limit,
    params.search,
    params.category,
    params.department,
    params.status,
    params.sortBy,
    params.isPreorder,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    rawApiProducts,
    total,
    totalPages,
    isLoading,
    error,
    refetch: fetchProducts,
  };
}
