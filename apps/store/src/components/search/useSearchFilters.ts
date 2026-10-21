'use client';

import { useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type {
  FilterState,
  CatalogFilterOptions,
} from '../catalog/catalogTypes';
import type { ApiProduct } from '@repo/types';

interface UseSearchFiltersParams {
  productsList: ApiProduct[];
  categories: Array<{
    id: string;
    name: string;
    nameTh?: string;
    department?: string;
  }>;
}

export function useSearchFilters({
  productsList,
  categories,
}: UseSearchFiltersParams) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.trim() ?? '';

  const pageParam = parseInt(searchParams.get('page') ?? '1', 10);
  const currentPage =
    Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  // Derive filter state from URL search params
  const filters = useMemo<FilterState>(() => {
    const deptParam = searchParams.get('department')?.trim() ?? '';
    const subCatParam = searchParams.get('subCategory')?.trim() ?? '';
    const priceParam =
      (searchParams.get('priceRange')?.trim() as FilterState['priceRange']) ??
      null;
    const tagParam =
      searchParams.get('tag')?.trim() ?? searchParams.get('tags')?.trim() ?? '';
    const onSaleParam = searchParams.get('onSale') === 'true';
    const newArrivalsParam = searchParams.get('newArrivals') === 'true';
    const sortParam =
      (searchParams.get('sort')?.trim() as FilterState['sortBy']) ?? 'featured';

    const tagsList: string[] = tagParam
      ? tagParam.split(',').filter(Boolean)
      : [];
    if (onSaleParam && !tagsList.some((t) => t.toUpperCase() === 'SALE')) {
      tagsList.push('SALE');
    }
    if (
      newArrivalsParam &&
      !tagsList.some(
        (t) => t.toUpperCase() === 'NEW ARRIVAL' || t.toUpperCase() === 'NEW',
      )
    ) {
      tagsList.push('NEW ARRIVAL');
    }

    return {
      departments: deptParam ? deptParam.split(',').filter(Boolean) : [],
      subCategories: subCatParam ? subCatParam.split(',').filter(Boolean) : [],
      priceRange: priceParam,
      tags: tagsList,
      sortBy: sortParam,
    };
  }, [searchParams]);

  // URL sync handler
  const updateUrlFilters = (
    updated: Partial<FilterState>,
    newPage: number = 1,
  ) => {
    const next = { ...filters, ...updated };
    const sp = new URLSearchParams();

    if (query) sp.set('q', query);
    if (next.departments.length > 0)
      sp.set('department', next.departments.join(','));
    if (next.subCategories.length > 0)
      sp.set('subCategory', next.subCategories.join(','));
    if (next.priceRange) sp.set('priceRange', next.priceRange);
    if (next.tags.length > 0) sp.set('tag', next.tags.join(','));
    if (next.sortBy && next.sortBy !== 'featured') sp.set('sort', next.sortBy);
    if (newPage > 1) sp.set('page', newPage.toString());

    router.push(`/search?${sp.toString()}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    updateUrlFilters({}, newPage);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Distinct filter options extracted from catalog & categories tree
  const filterOptions = useMemo<CatalogFilterOptions>(() => {
    const deptSet = new Set<string>();
    const subCatMap = new Map<
      string,
      { key: string; labelEn: string; labelTh: string }
    >();

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
      if (p.categoryName) {
        subCatMap.set(p.categoryName, {
          key: p.categoryName,
          labelEn: p.categoryName,
          labelTh: p.categoryNameTh ?? p.categoryName,
        });
      }
    });

    return {
      departments: Array.from(deptSet),
      subCategories: Array.from(subCatMap.values()),
    };
  }, [categories, productsList]);

  const toggleDepartment = (dept: string) => {
    const lower = dept.toLowerCase();
    const departments = filters.departments.includes(lower)
      ? filters.departments.filter((d) => d !== lower)
      : [...filters.departments, lower];
    updateUrlFilters({ departments });
  };

  const toggleSubCategory = (subCat: string) => {
    const subCategories = filters.subCategories.includes(subCat)
      ? filters.subCategories.filter((c) => c !== subCat)
      : [...filters.subCategories, subCat];
    updateUrlFilters({ subCategories });
  };

  const handlePriceRangeChange = (priceRange: FilterState['priceRange']) => {
    updateUrlFilters({ priceRange });
  };

  const handleToggleTag = (tag: string) => {
    const isSelected = filters.tags.some(
      (t) => t.toUpperCase() === tag.toUpperCase(),
    );
    const tags = isSelected
      ? filters.tags.filter((t) => t.toUpperCase() !== tag.toUpperCase())
      : [...filters.tags, tag];
    updateUrlFilters({ tags });
  };

  const handleSortChange = (sortBy: FilterState['sortBy']) => {
    updateUrlFilters({ sortBy });
  };

  const clearAllFilters = () => {
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : '/search', {
      scroll: false,
    });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += filters.departments.length;
    count += filters.subCategories.length;
    if (filters.priceRange !== null) count += 1;
    count += filters.tags.length;
    return count;
  }, [filters]);

  return {
    query,
    filters,
    currentPage,
    handlePageChange,
    filterOptions,
    activeFilterCount,
    toggleDepartment,
    toggleSubCategory,
    handlePriceRangeChange,
    handleToggleTag,
    handleSortChange,
    clearAllFilters,
  };
}
