'use client';

import { useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { FilterState, SearchFilterOptions } from './searchTypes';
import type { StorefrontProduct } from '@repo/types';

interface UseSearchFiltersParams {
  productsList: StorefrontProduct[];
  categories: Array<{
    id: string;
    name: string;
    nameTh?: string;
    department?: string;
  }>;
}

export function useSearchFilters({ productsList, categories }: UseSearchFiltersParams) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.trim() ?? '';

  // Derive filter state from URL search params
  const filters = useMemo<FilterState>(() => {
    const deptParam = searchParams.get('department')?.trim() ?? '';
    const subCatParam = searchParams.get('subCategory')?.trim() ?? '';
    const priceParam = (searchParams.get('priceRange')?.trim() as FilterState['priceRange']) ?? null;
    const colorsParam = searchParams.get('colors')?.trim() ?? '';
    const onSaleParam = searchParams.get('onSale') === 'true';
    const newArrivalsParam = searchParams.get('newArrivals') === 'true';
    const sortParam = (searchParams.get('sort')?.trim() as FilterState['sortBy']) ?? 'featured';

    return {
      departments: deptParam ? deptParam.split(',').filter(Boolean) : [],
      subCategories: subCatParam ? subCatParam.split(',').filter(Boolean) : [],
      priceRange: priceParam,
      colors: colorsParam ? colorsParam.split(',').filter(Boolean) : [],
      onSale: onSaleParam,
      newArrivals: newArrivalsParam,
      sortBy: sortParam,
    };
  }, [searchParams]);

  // URL sync handler
  const updateUrlFilters = (updated: Partial<FilterState>) => {
    const next = { ...filters, ...updated };
    const sp = new URLSearchParams();

    if (query) sp.set('q', query);
    if (next.departments.length > 0) sp.set('department', next.departments.join(','));
    if (next.subCategories.length > 0) sp.set('subCategory', next.subCategories.join(','));
    if (next.priceRange) sp.set('priceRange', next.priceRange);
    if (next.colors.length > 0) sp.set('colors', next.colors.join(','));
    if (next.onSale) sp.set('onSale', 'true');
    if (next.newArrivals) sp.set('newArrivals', 'true');
    if (next.sortBy && next.sortBy !== 'featured') sp.set('sort', next.sortBy);

    router.push(`/search?${sp.toString()}`, { scroll: false });
  };

  // Distinct filter options extracted from catalog & categories tree
  const filterOptions = useMemo<SearchFilterOptions>(() => {
    const deptSet = new Set<string>();
    const subCatMap = new Map<string, { key: string; labelEn: string; labelTh: string }>();
    const colorSet = new Set<string>();

    categories.forEach((cat) => {
      if (cat.department) deptSet.add(cat.department.toLowerCase());
      if (cat.name) {
        subCatMap.set(cat.name, {
          key: cat.name,
          labelEn: cat.name,
          labelTh: cat.nameTh ?? cat.name,
        });
      }
    });

    productsList.forEach((p) => {
      if (p.department) deptSet.add(p.department.toLowerCase());
      if (p.subCategory) {
        subCatMap.set(p.subCategory, {
          key: p.subCategory,
          labelEn: p.subCategory,
          labelTh: p.subCategoryTh ?? p.subCategory,
        });
      }
      if (p.colors && Array.isArray(p.colors)) {
        p.colors.forEach((c) => colorSet.add(c));
      }
    });

    return {
      departments: Array.from(deptSet),
      subCategories: Array.from(subCatMap.values()),
      colors: Array.from(colorSet),
    };
  }, [productsList, categories]);

  const toggleDepartment = (dept: string) => {
    const departments = filters.departments.includes(dept)
      ? filters.departments.filter((d) => d !== dept)
      : [...filters.departments, dept];
    updateUrlFilters({ departments });
  };

  const toggleSubCategory = (subCat: string) => {
    const subCategories = filters.subCategories.includes(subCat)
      ? filters.subCategories.filter((s) => s !== subCat)
      : [...filters.subCategories, subCat];
    updateUrlFilters({ subCategories });
  };

  const toggleColor = (colorHex: string) => {
    const colors = filters.colors.includes(colorHex)
      ? filters.colors.filter((c) => c !== colorHex)
      : [...filters.colors, colorHex];
    updateUrlFilters({ colors });
  };

  const handlePriceRangeChange = (priceRange: FilterState['priceRange']) => {
    updateUrlFilters({ priceRange });
  };

  const handleToggleOnSale = (onSale: boolean) => {
    updateUrlFilters({ onSale });
  };

  const handleToggleNewArrivals = (newArrivals: boolean) => {
    updateUrlFilters({ newArrivals });
  };

  const handleSortChange = (sortBy: FilterState['sortBy']) => {
    updateUrlFilters({ sortBy });
  };

  const clearAllFilters = () => {
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : '/search', { scroll: false });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += filters.departments.length;
    count += filters.subCategories.length;
    count += filters.colors.length;
    if (filters.priceRange !== null) count += 1;
    if (filters.onSale) count += 1;
    if (filters.newArrivals) count += 1;
    return count;
  }, [filters]);

  return {
    query,
    filters,
    filterOptions,
    activeFilterCount,
    toggleDepartment,
    toggleSubCategory,
    toggleColor,
    handlePriceRangeChange,
    handleToggleOnSale,
    handleToggleNewArrivals,
    handleSortChange,
    clearAllFilters,
  };
}
