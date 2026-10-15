import { useState, useEffect, useCallback } from 'react';
import { productRequester } from '../api/requester/productRequester';
import type { ApiProduct } from '@repo/types';
import type { QueryProductsInput } from '@repo/validators';

export function useProducts(params: Partial<QueryProductsInput> = {}) {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productRequester.getProducts(params);
      if (response) {
        if ('data' in response && Array.isArray(response.data)) {
          setProducts(response.data);
          setTotal(response.pagination?.total ?? response.data.length);
          setTotalPages(response.pagination?.totalPages ?? 1);
        } else if (Array.isArray(response)) {
          const list = response as unknown as ApiProduct[];
          setProducts(list);
          setTotal(list.length);
          setTotalPages(1);
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch products';
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
    total,
    totalPages,
    isLoading,
    error,
    refetch: fetchProducts,
  };
}
