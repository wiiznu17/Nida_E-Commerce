'use client';

import React, { useState, useMemo } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import { useCatalog } from '@/context/CatalogContext';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import type { StorefrontProduct } from '@repo/types';
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

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const { productsList, isLoading } = useCatalog();
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Match saved IDs or slugs to active catalog products
  const rawWishlistProducts = useMemo(() => {
    return productsList.filter(
      (product) => wishlist.includes(product.id) || wishlist.includes(product.slug)
    );
  }, [productsList, wishlist]);

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


  const handleAddToCart = (product: StorefrontProduct) => {
    const defaultSize =
      product.department === 'shoes'
        ? 'US 9'
        : product.category === 'bags' || product.category === 'home'
          ? 'One Size'
          : 'M';
    const defaultColor = product.colors?.[0] ?? '#2B1810';

    addToCart(product, defaultSize, defaultColor);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* 1. Sticky Nike-Style Top Bar (Shared Catalog Component) */}
      <CatalogTopBar
        title={t('nav.wishlist')}
        totalCount={filteredProducts.length}
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
          {/* Collapsible Left Filter Sidebar (Shared Catalog Component) */}
          {isFilterVisible && rawWishlistProducts.length > 0 && (
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
              <div className="py-24 text-center">
                <div className="inline-block w-8 h-8 border-2 border-brand-brown border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <WishlistEmptyState
                isFiltered={activeFilterCount > 0}
                onClearFilters={clearAllFilters}
              />
            ) : (
              <CatalogProductGrid
                products={filteredProducts}
                isFilterVisible={isFilterVisible}
                onAddToCart={handleAddToCart}
              />
            )}
          </main>
        </div>
      </div>

      {/* 3. Mobile Slide-Over Filter Drawer (Shared Catalog Component) */}
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
    </div>
  );
}
