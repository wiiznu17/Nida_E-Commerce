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
import { LoadingSpinner } from '@/components/ui';

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

      <CollectionControlBar
        totalCount={totalCount}
        sortBy={sortBy}
        gridCols={gridCols}
        onSortChange={(sort) => updateUrlFilters({ sort })}
        onToggleGridCols={setGridCols}
      />

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">

        {isLoading ? (
          <LoadingSpinner className="py-24" />
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
      fallback={<LoadingSpinner fullScreen />}
    >
      <CollectionDepartmentContent />
    </Suspense>
  );
}
