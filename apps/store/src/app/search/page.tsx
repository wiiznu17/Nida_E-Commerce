'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCatalog } from '@/context/CatalogContext';
import { useCart } from '@/context/CartContext';
import type { StorefrontProduct } from '@repo/types';
import {
  SearchTopBar,
  SearchFilterSidebar,
  SearchProductGrid,
  SearchEmptyState,
  SearchMobileDrawer,
  INITIAL_FILTER_STATE,
  type FilterState,
  type SearchFilterOptions,
} from '@/components/search';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.trim() || '';

  const { productsList } = useCatalog();
  const { addToCart } = useCart();

  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);

  // Distinct filter options extracted from catalog
  const filterOptions = useMemo<SearchFilterOptions>(() => {
    const deptSet = new Set<string>();
    const subCatMap = new Map<string, { key: string; labelEn: string; labelTh: string }>();
    const colorSet = new Set<string>();

    productsList.forEach((p) => {
      if (p.department) deptSet.add(p.department.toLowerCase());
      if (p.category) deptSet.add(p.category.toLowerCase());

      if (p.subCategory) {
        subCatMap.set(p.subCategory, {
          key: p.subCategory,
          labelEn: p.subCategory,
          labelTh: p.subCategoryTh || p.subCategory,
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
  }, [productsList]);

  // Toggle filter handlers
  const toggleDepartment = (dept: string) => {
    setFilters((prev) => ({
      ...prev,
      departments: prev.departments.includes(dept)
        ? prev.departments.filter((d) => d !== dept)
        : [...prev.departments, dept],
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

  const toggleColor = (colorHex: string) => {
    setFilters((prev) => ({
      ...prev,
      colors: prev.colors.includes(colorHex)
        ? prev.colors.filter((c) => c !== colorHex)
        : [...prev.colors, colorHex],
    }));
  };

  const handlePriceRangeChange = (priceRange: FilterState['priceRange']) => {
    setFilters((prev) => ({ ...prev, priceRange }));
  };

  const handleToggleOnSale = (onSale: boolean) => {
    setFilters((prev) => ({ ...prev, onSale }));
  };

  const handleToggleNewArrivals = (newArrivals: boolean) => {
    setFilters((prev) => ({ ...prev, newArrivals }));
  };

  const handleSortChange = (sortBy: FilterState['sortBy']) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  };

  const clearAllFilters = () => {
    setFilters({
      ...INITIAL_FILTER_STATE,
      sortBy: filters.sortBy,
    });
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

  // Main filtered & sorted product list
  const filteredProducts = useMemo(() => {
    let result = productsList.slice();

    if (query) {
      const q = query.toLowerCase();
      result = result.filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          (p.nameTh && p.nameTh.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q) ||
          (p.department && p.department.toLowerCase().includes(q)) ||
          (p.subCategory && p.subCategory.toLowerCase().includes(q)) ||
          (p.subCategoryTh && p.subCategoryTh.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.descriptionTh && p.descriptionTh.toLowerCase().includes(q)) ||
          (p.tag && p.tag.toLowerCase().includes(q))
        );
      });
    }

    if (filters.departments.length > 0) {
      result = result.filter((p) => {
        const pDept = (p.department || p.category || '').toLowerCase();
        return filters.departments.some(
          (d) => pDept.includes(d) || (d === 'bags' && pDept.includes('bag'))
        );
      });
    }

    if (filters.subCategories.length > 0) {
      result = result.filter((p) => {
        return p.subCategory && filters.subCategories.includes(p.subCategory);
      });
    }

    if (filters.priceRange) {
      if (filters.priceRange === 'under100') {
        result = result.filter((p) => p.price < 100);
      } else if (filters.priceRange === '100-200') {
        result = result.filter((p) => p.price >= 100 && p.price <= 200);
      } else if (filters.priceRange === 'over200') {
        result = result.filter((p) => p.price > 200);
      }
    }

    if (filters.colors.length > 0) {
      result = result.filter((p) => {
        if (!p.colors || !Array.isArray(p.colors)) return false;
        return p.colors.some((c) => filters.colors.includes(c));
      });
    }

    if (filters.onSale) {
      result = result.filter((p) => Boolean(p.originalPrice && p.originalPrice > p.price));
    }

    if (filters.newArrivals) {
      result = result.filter((p) => {
        const tag = (p.tag || '').toLowerCase();
        const tagTh = (p.tagTh || '').toLowerCase();
        return tag.includes('new') || tagTh.includes('ใหม่');
      });
    }

    if (filters.sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === 'newest') {
      result.sort((a, b) => b.id.localeCompare(a.id));
    }

    return result;
  }, [productsList, query, filters]);

  const handleAddToCart = (product: StorefrontProduct) => {
    addToCart(product, 'M', product.colors?.[0] || '#2B1810');
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* 1. Sticky Control Bar */}
      <SearchTopBar
        query={query}
        totalCount={filteredProducts.length}
        isFilterVisible={isFilterVisible}
        activeFilterCount={activeFilterCount}
        sortBy={filters.sortBy}
        onToggleFilter={() => setIsFilterVisible(!isFilterVisible)}
        onOpenMobileFilter={() => setIsMobileFilterOpen(true)}
        onSortChange={handleSortChange}
      />

      {/* 2. Main Content Layout: Sidebar + Grid */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        <div className="flex gap-8">
          {/* Collapsible Left Desktop Sidebar */}
          {isFilterVisible && (
            <aside className="hidden md:block w-60 lg:w-64 shrink-0 transition-all duration-300">
              <div className="sticky top-40 max-h-[calc(100vh-180px)] overflow-y-auto pr-3">
                <SearchFilterSidebar
                  filters={filters}
                  filterOptions={filterOptions}
                  activeFilterCount={activeFilterCount}
                  onToggleDepartment={toggleDepartment}
                  onToggleSubCategory={toggleSubCategory}
                  onToggleColor={toggleColor}
                  onPriceRangeChange={handlePriceRangeChange}
                  onToggleOnSale={handleToggleOnSale}
                  onToggleNewArrivals={handleToggleNewArrivals}
                  onClearAll={clearAllFilters}
                />
              </div>
            </aside>
          )}

          {/* Product Grid or Empty State */}
          <main className="flex-1 min-w-0">
            {filteredProducts.length === 0 ? (
              <SearchEmptyState onClearAll={clearAllFilters} />
            ) : (
              <SearchProductGrid
                products={filteredProducts}
                isFilterVisible={isFilterVisible}
                onAddToCart={handleAddToCart}
              />
            )}
          </main>
        </div>
      </div>

      {/* 3. Mobile Filter Drawer */}
      <SearchMobileDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        totalCount={filteredProducts.length}
      >
        <SearchFilterSidebar
          filters={filters}
          filterOptions={filterOptions}
          activeFilterCount={activeFilterCount}
          onToggleDepartment={toggleDepartment}
          onToggleSubCategory={toggleSubCategory}
          onToggleColor={toggleColor}
          onPriceRangeChange={handlePriceRangeChange}
          onToggleOnSale={handleToggleOnSale}
          onToggleNewArrivals={handleToggleNewArrivals}
          onClearAll={clearAllFilters}
        />
      </SearchMobileDrawer>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white py-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#2B1810] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
