'use client';

import React, { useState, useMemo } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import { useCatalog } from '@/context/CatalogContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiProduct } from '@repo/types';
import {
  CatalogTopBar,
  CatalogFilterSidebar,
  CatalogProductGrid,
  CatalogMobileDrawer,
} from '@/components/catalog';
import {
  WishlistEmptyState,
  useWishlistFilters,
} from '@/components/wishlist';
import { LoadingSpinner } from '@/components/ui';

export default function WishlistPage() {
  const { wishlist, isLoading: isWishlistLoading } = useWishlist();
  const { productsList, isLoading: isCatalogLoading } = useCatalog();
  const { addToCart } = useCart();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { t } = useLanguage();

  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Match saved IDs to active catalog products (only if authenticated)
  const rawWishlistProducts = useMemo(() => {
    if (!isAuthenticated) return [];
    return productsList.filter((product) => wishlist.includes(product.id));
  }, [productsList, wishlist, isAuthenticated]);

  const {
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
  } = useWishlistFilters(rawWishlistProducts);


  const isPageLoading = isAuthLoading || (isAuthenticated && (isWishlistLoading || isCatalogLoading));

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* 1. Sticky Nike-Style Top Bar (Shared Catalog Component) */}
      <CatalogTopBar
        title={t('nav.wishlist')}
        totalCount={isAuthenticated ? filteredProducts.length : 0}
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
          {/* Collapsible Left Filter Sidebar (Shared Catalog Component) */}
          {isAuthenticated && isFilterVisible && rawWishlistProducts.length > 0 && (
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
            {isPageLoading ? (
              <LoadingSpinner className="py-24" />
            ) : !isAuthenticated ? (
              <WishlistEmptyState
                isFiltered={false}
                onClearFilters={clearAllFilters}
                isUnauthenticated={true}
              />
            ) : filteredProducts.length === 0 ? (
              <WishlistEmptyState
                isFiltered={activeFilterCount > 0}
                onClearFilters={clearAllFilters}
              />
            ) : (
              <CatalogProductGrid
                products={filteredProducts}
                isFilterVisible={isFilterVisible}
                onAddToCart={addToCart}
              />
            )}
          </main>
        </div>
      </div>

      {/* 3. Mobile Slide-Over Filter Drawer (Shared Catalog Component) */}
      {isAuthenticated && (
        <CatalogMobileDrawer
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
          totalCount={filteredProducts.length}
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
      )}
    </div>
  );
}
