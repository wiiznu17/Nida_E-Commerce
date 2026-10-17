'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useCatalog } from '@/context/CatalogContext';
import { useCart } from '@/context/CartContext';
import { catalogRequester } from '@/api';
import type { ApiProduct } from '@repo/types';
import {
  CatalogTopBar,
  CatalogFilterSidebar,
  CatalogProductGrid,
  CatalogMobileDrawer,
} from '@/components/catalog';
import {
  SearchEmptyState,
  useSearchFilters,
} from '@/components/search';
import { LoadingSpinner, Pagination } from '@/components/ui';


function SearchPageContent() {
  const { productsList, categories } = useCatalog();
  const { addToCart } = useCart();

  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [serverProducts, setServerProducts] = useState<ApiProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const pageSize = 24;

  const {
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
  } = useSearchFilters({ productsList, categories });

  // Server Search Fetch Effect
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    let minPrice: number | undefined;
    let maxPrice: number | undefined;
    if (filters.priceRange === 'under1000') {
      minPrice = 0;
      maxPrice = 1000;
    } else if (filters.priceRange === '1000-2500') {
      minPrice = 1000;
      maxPrice = 2500;
    } else if (filters.priceRange === 'over2500') {
      minPrice = 2500;
    }

    const sortMap: Record<string, 'featured' | 'newest' | 'price_asc' | 'price_desc'> = {
      featured: 'featured',
      newest: 'newest',
      'price-asc': 'price_asc',
      'price-desc': 'price_desc',
    };

    catalogRequester.getProductsWithMeta({
      search: query || undefined,
      department: filters.departments.length === 1 ? filters.departments[0] : undefined,
      subCategory: filters.subCategories.length === 1 ? filters.subCategories[0] : undefined,
      minPrice,
      maxPrice,
      tag: filters.tags.length > 0 ? filters.tags.join(',') : undefined,
      sortBy: sortMap[filters.sortBy] ?? 'featured',
      page: currentPage,
      limit: pageSize,
    })
      .then((res) => {
        if (!isCancelled) {
          let products = res.products;
          if (filters.departments.length > 1) {
            products = products.filter((p) =>
              filters.departments.some((d) => p.department.toLowerCase().includes(d))
            );
          }
          if (filters.subCategories.length > 1) {
            products = products.filter((p) =>
              p.categoryName && filters.subCategories.includes(p.categoryName)
            );
          }

          setServerProducts(products);
          setTotalCount(res.total);
          setTotalPages(res.totalPages);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          console.warn('[SearchPage] Server search error:', err);
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [query, filters, currentPage, pageSize]);

  const handleAddToCart = (product: ApiProduct) => {
    const defaultColor =
      product.colors && product.colors.length > 0
        ? product.colors[0]?.name || product.colors[0]?.hex
        : 'Standard';
    addToCart(product, 'M', defaultColor);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* 1. Sticky Control Bar */}
      <CatalogTopBar
        searchQuery={query}
        totalCount={totalCount}
        isFilterVisible={isFilterVisible}
        activeFilterCount={activeFilterCount}
        sortBy={filters.sortBy}
        onToggleFilter={() => setIsFilterVisible(!isFilterVisible)}
        onOpenMobileFilter={() => setIsMobileFilterOpen(true)}
        onSortChange={handleSortChange}
      />

      {/* 2. Main Content Layout: Sidebar + Grid */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
        <div className="flex gap-8">
          {/* Collapsible Left Filter Sidebar */}
          {isFilterVisible && (
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto pr-2 pb-12">
                <CatalogFilterSidebar
                  filters={filters}
                  filterOptions={filterOptions}
                  activeFilterCount={activeFilterCount}
                  onToggleDepartment={toggleDepartment}
                  onToggleSubCategory={toggleSubCategory}
                  onPriceRangeChange={handlePriceRangeChange}
                  onToggleTag={handleToggleTag}
                  onClearAll={clearAllFilters}
                />
              </div>
            </aside>
          )}

          {/* Product Grid Area */}
          <main className="flex-1 min-w-0">
            {isLoading ? (
              <LoadingSpinner className="py-24" />
            ) : serverProducts.length === 0 ? (
              <SearchEmptyState onClearAll={clearAllFilters} />
            ) : (
              <div className="space-y-8">
                <CatalogProductGrid
                  products={serverProducts}
                  isFilterVisible={isFilterVisible}
                  onAddToCart={handleAddToCart}
                />

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalCount}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 3. Mobile Slide-Over Drawer */}
      <CatalogMobileDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        totalCount={totalCount}
      >
        <CatalogFilterSidebar
          filters={filters}
          filterOptions={filterOptions}
          activeFilterCount={activeFilterCount}
          onToggleDepartment={toggleDepartment}
          onToggleSubCategory={toggleSubCategory}
          onPriceRangeChange={handlePriceRangeChange}
          onToggleTag={handleToggleTag}
          onClearAll={clearAllFilters}
        />
      </CatalogMobileDrawer>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={<LoadingSpinner fullScreen />}
    >
      <SearchPageContent />
    </Suspense>
  );
}
