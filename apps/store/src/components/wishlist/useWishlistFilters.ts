'use client';

import { useState, useMemo } from 'react';
import type { ApiProduct } from '@repo/types';
import { INITIAL_FILTER_STATE } from '../catalog/catalogConstants';
import type {
  FilterState,
  CatalogFilterOptions,
  FilterCategoryOption,
} from '../catalog/catalogTypes';

export function useWishlistFilters(rawWishlistProducts: ApiProduct[]) {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);

  // Distinct filter options extracted from the user's wishlist items
  const filterOptions = useMemo<CatalogFilterOptions>(() => {
    const deptSet = new Set<string>();
    const subCatMap = new Map<string, FilterCategoryOption>();

    rawWishlistProducts.forEach((p) => {
      if (p.department) deptSet.add(p.department.toLowerCase());

      const subKey = p.categoryName || p.categorySlug;
      if (subKey) {
        subCatMap.set(subKey, {
          key: subKey,
          labelEn: p.categoryName || p.categorySlug,
          labelTh: p.categoryNameTh || p.categoryName || p.categorySlug,
        });
      }
    });

    return {
      departments: Array.from(deptSet),
      subCategories: Array.from(subCatMap.values()),
    };
  }, [rawWishlistProducts]);

  // Filter & Sort wishlist products
  const filteredProducts = useMemo(() => {
    let list = [...rawWishlistProducts];

    // 1. Department filter (Exact token matching: ensures 'women' does NOT match 'men')
    if (filters.departments.length > 0) {
      list = list.filter((p) => {
        const pDept = (p.department ?? '').toLowerCase();
        return filters.departments.some((d) => {
          const target = d.toLowerCase();
          if (target === 'men') return pDept === 'men';
          if (target === 'women') return pDept === 'women';
          return pDept === target || pDept.split(/[\s,/]+/).includes(target);
        });
      });
    }

    // 2. SubCategory / Category filter
    if (filters.subCategories.length > 0) {
      list = list.filter((p) => {
        const sub = p.categoryName ?? '';
        const cat = p.categorySlug ?? '';
        return filters.subCategories.some((sc) => sc === sub || sc === cat);
      });
    }

    // 3. Price range filter
    if (filters.priceRange) {
      if (filters.priceRange === 'under100') {
        list = list.filter((p) => p.basePrice < 100);
      } else if (filters.priceRange === '100-200') {
        list = list.filter((p) => p.basePrice >= 100 && p.basePrice <= 200);
      } else if (filters.priceRange === 'over200') {
        list = list.filter((p) => p.basePrice > 200);
      }
    }

    // 4. Marketing Badges / Tags
    if (filters.tags && filters.tags.length > 0) {
      list = list.filter((p) => {
        const pTag = (p.tag || '').toUpperCase();
        return filters.tags.some((t) => {
          const upper = t.toUpperCase();
          if (upper === 'NEW ARRIVAL' || upper === 'NEW') {
            return pTag === 'NEW ARRIVAL' || pTag === 'NEW';
          }
          return pTag === upper;
        });
      });
    }

    // 5. Sorting
    if (filters.sortBy === 'price-asc') {
      list.sort((a, b) => a.basePrice - b.basePrice);
    } else if (filters.sortBy === 'price-desc') {
      list.sort((a, b) => b.basePrice - a.basePrice);
    } else if (filters.sortBy === 'newest') {
      list.sort((a, b) => {
        if (a.tag === 'NEW' && b.tag !== 'NEW') return -1;
        if (b.tag === 'NEW' && a.tag !== 'NEW') return 1;
        return a.name.localeCompare(b.name);
      });
    }

    return list;
  }, [rawWishlistProducts, filters]);

  // Filter mutation handlers
  const toggleDepartment = (dept: string) => {
    const normalized = dept.toLowerCase();
    setFilters((prev) => ({
      ...prev,
      departments: prev.departments.includes(normalized)
        ? prev.departments.filter((d) => d !== normalized)
        : [...prev.departments, normalized],
    }));
  };

  const toggleSubCategory = (subCat: string) => {
    setFilters((prev) => ({
      ...prev,
      subCategories: prev.subCategories.includes(subCat)
        ? prev.subCategories.filter((s) => s !== subCat)
        : [...prev.subCategories, subCat],
    }));
  };

  const handlePriceRangeChange = (priceRange: FilterState['priceRange']) => {
    setFilters((prev) => ({ ...prev, priceRange }));
  };

  const handleToggleTag = (tag: string) => {
    const upper = tag.toUpperCase();
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.some((t) => t.toUpperCase() === upper)
        ? prev.tags.filter((t) => t.toUpperCase() !== upper)
        : [...prev.tags, tag],
    }));
  };

  const handleSortChange = (sortBy: FilterState['sortBy']) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  };

  const clearAllFilters = () => {
    setFilters(INITIAL_FILTER_STATE);
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
    filters,
    filterOptions,
    filteredProducts,
    activeFilterCount,
    toggleDepartment,
    toggleSubCategory,
    handlePriceRangeChange,
    handleToggleTag,
    handleSortChange,
    clearAllFilters,
  };
}
