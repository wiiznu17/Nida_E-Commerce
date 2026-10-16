'use client';

import React, { Suspense } from 'react';
import {
  CollectionBanner,
  CollectionCategoryNav,
  CollectionControlBar,
  CollectionProductGrid,
  CollectionEmptyState,
  useCollectionDepartment,
} from '@/components/collection';

function CollectionDepartmentContent() {
  const {
    selectedCategory,
    selectedSubCategory,
    sortBy,
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
    <div className="bg-brand-cream min-h-screen">
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
          updateUrlFilters({ category: slug, subCategory: null })
        }
        subCategories={availableSubCategories}
        selectedSubCategory={selectedSubCategory}
        onSelectSubCategory={(slug) =>
          updateUrlFilters({ subCategory: slug })
        }
        totalCount={totalCount}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CollectionControlBar
          totalCount={totalCount}
          sortBy={sortBy}
          gridCols={gridCols}
          onSortChange={(sort) => updateUrlFilters({ sort })}
          onToggleGridCols={setGridCols}
        />

        {isLoading ? (
          <div className="py-24 flex justify-center items-center">
            <div className="w-8 h-8 border-2 border-brand-brown border-t-transparent rounded-full animate-spin" />
          </div>
        ) : serverProducts.length > 0 ? (
          <CollectionProductGrid
            products={serverProducts}
            gridCols={gridCols}
            onAddToCart={addToCart}
          />
        ) : (
          <CollectionEmptyState
            onResetFilters={() =>
              updateUrlFilters({ category: null, subCategory: null })
            }
          />
        )}
      </div>
    </div>
  );
}

export default function CollectionDepartmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-cream flex justify-center items-center">
          <div className="w-8 h-8 border-2 border-brand-brown border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CollectionDepartmentContent />
    </Suspense>
  );
}
