'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useCatalog } from '@/context/CatalogContext';
import { useCart } from '@/context/CartContext';
import { fetchCatalogProductsWithMeta } from '@/lib/catalogApi';
import type { StorefrontProduct } from '@repo/types';
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


function SearchPageContent() {
  const { productsList, categories } = useCatalog();
  const { addToCart } = useCart();

  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [serverProducts, setServerProducts] = useState<StorefrontProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const {
    query,
    filters,
    filterOptions,
    activeFilterCount,
    toggleDepartment,
    toggleSubCategory,
    handlePriceRangeChange,
    handleToggleOnSale,
    handleToggleNewArrivals,
    handleSortChange,
    clearAllFilters,
  } = useSearchFilters({ productsList, categories });

  // Server Search Fetch Effect
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    let minPrice: number | undefined;
    let maxPrice: number | undefined;
    if (filters.priceRange === 'under100') {
      minPrice = 0;
      maxPrice = 100;
    } else if (filters.priceRange === '100-200') {
      minPrice = 100;
      maxPrice = 200;
    } else if (filters.priceRange === 'over200') {
      minPrice = 200;
    }

    const sortMap: Record<string, 'featured' | 'newest' | 'price_asc' | 'price_desc'> = {
      featured: 'featured',
      newest: 'newest',
      'price-asc': 'price_asc',
      'price-desc': 'price_desc',
    };

    fetchCatalogProductsWithMeta({
      search: query || undefined,
      department: filters.departments.length === 1 ? filters.departments[0] : undefined,
      subCategory: filters.subCategories.length === 1 ? filters.subCategories[0] : undefined,
      minPrice,
      maxPrice,
      tag: filters.onSale ? 'SALE' : filters.newArrivals ? 'NEW' : undefined,
      sortBy: sortMap[filters.sortBy] ?? 'featured',
      limit: 48,
    })
      .then((res) => {
        if (!isCancelled) {
          let products = res.products;
          if (filters.departments.length > 1) {
            products = products.filter((p) =>
              filters.departments.some((d) => (p.department || '').toLowerCase().includes(d))
            );
          }
          if (filters.subCategories.length > 1) {
            products = products.filter((p) =>
              p.subCategory && filters.subCategories.includes(p.subCategory)
            );
          }

          setServerProducts(products);
          setTotalCount(res.total);
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
  }, [query, filters]);

  const handleAddToCart = (product: StorefrontProduct) => {
    addToCart(product, 'M', product.colors?.[0] || '#2B1810');
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
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                  onToggleOnSale={handleToggleOnSale}
                  onToggleNewArrivals={handleToggleNewArrivals}
                  onClearAll={clearAllFilters}
                />
              </div>
            </aside>
          )}

          {/* Product Grid Area */}
          <main className="flex-1 min-w-0">
            {isLoading ? (
              <div className="py-24 text-center">
                <div className="inline-block w-8 h-8 border-2 border-[#2B1810] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : serverProducts.length === 0 ? (
              <SearchEmptyState onClearAll={clearAllFilters} />
            ) : (
              <CatalogProductGrid
                products={serverProducts}
                isFilterVisible={isFilterVisible}
                onAddToCart={handleAddToCart}
              />
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
          onToggleOnSale={handleToggleOnSale}
          onToggleNewArrivals={handleToggleNewArrivals}
          onClearAll={clearAllFilters}
        />
      </CatalogMobileDrawer>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#2B1810] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
