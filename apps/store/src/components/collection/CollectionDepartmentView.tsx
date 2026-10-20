'use client';

import React from 'react';
import {
  CollectionBanner,
  CollectionCategoryNav,
  CollectionControlBar,
  CollectionProductGrid,
  CollectionEmptyState,
  useCollectionDepartment,
} from '@/components/collection';
import { LoadingSpinner, Pagination } from '@/components/ui';

export function CollectionDepartmentView() {
  const {
    selectedCategory,
    selectedSubCategory,
    sortBy,
    currentPage,
    totalPages,
    pageSize,
    handlePageChange,
    gridCols,
    setGridCols,
    primaryCategories,
    availableSubCategories,
    updateUrlFilters,
    serverProducts,
    totalCount,
    isLoading,
    currentTitle,
    currentSubtitle,
    currentTag,
    currentBgImage,
    addToCart,
  } = useCollectionDepartment();

  return (
    <div className="bg-brand-cream min-h-screen font-sans">
      <CollectionBanner
        title={currentTitle}
        subtitle={currentSubtitle}
        bannerTag={currentTag}
        bgImage={currentBgImage}
      />

      <CollectionCategoryNav
        categories={primaryCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={(slug) =>
          updateUrlFilters({ category: slug, subCategory: null, page: 1 })
        }
        subCategories={availableSubCategories}
        selectedSubCategory={selectedSubCategory}
        onSelectSubCategory={(slug) =>
          updateUrlFilters({ subCategory: slug, page: 1 })
        }
        totalCount={totalCount}
      />

      <CollectionControlBar
        totalCount={totalCount}
        sortBy={sortBy}
        gridCols={gridCols}
        onSortChange={(sort) => updateUrlFilters({ sort, page: 1 })}
        onToggleGridCols={setGridCols}
      />

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        {isLoading ? (
          <LoadingSpinner className="py-24" />
        ) : serverProducts.length > 0 ? (
          <div className="space-y-8">
            <CollectionProductGrid
              products={serverProducts}
              gridCols={gridCols}
              onAddToCart={addToCart}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCount}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          </div>
        ) : (
          <CollectionEmptyState
            onResetFilters={() =>
              updateUrlFilters({ category: null, subCategory: null, page: 1 })
            }
          />
        )}
      </div>
    </div>
  );
}
