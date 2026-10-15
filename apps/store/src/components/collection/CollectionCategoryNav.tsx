'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import type { CollectionCategoryNavProps } from './collectionTypes';

export function CollectionCategoryNav({
  categories,
  selectedCategory,
  onSelectCategory,
  subCategories,
  selectedSubCategory,
  onSelectSubCategory,
  totalCount,
}: CollectionCategoryNavProps) {
  const { t } = useLanguage();

  const showSubCategories = subCategories.length > 0;

  return (
    <div className="w-full">
      {/* 1. PRIMARY CATEGORY TIER */}
      {categories.length > 0 && (
        <div className="bg-[#FAF7F2] border-b border-[#EAE3D9] py-3.5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-3 overflow-x-auto">
            {/* Category Micro-Label */}
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D97706] shrink-0 pr-1 select-none">
              {t('collection.categoryLabel')}:
            </span>

            {/* All Categories Option */}
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              className={`text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xs transition-all whitespace-nowrap cursor-pointer border ${
                selectedCategory === null
                  ? 'bg-[#2B1810] text-white border-[#2B1810] shadow-xs'
                  : 'bg-white text-[#2B1810] border-gray-200 hover:border-[#2B1810]'
              }`}
            >
              {t('collection.allCategories')} ({totalCount})
            </button>

            {/* Individual Primary Categories */}
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => {
                  const isAlreadySelected = selectedCategory === cat.slug;
                  onSelectCategory(isAlreadySelected ? null : cat.slug);
                }}
                className={`text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xs transition-all whitespace-nowrap cursor-pointer border ${
                  selectedCategory === cat.slug
                    ? 'bg-[#2B1810] text-white border-[#2B1810] shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:text-[#2B1810] hover:border-[#2B1810]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. SECONDARY SUB CATEGORY TIER */}
      {showSubCategories && (
        <div className="bg-white border-b border-[#EAE3D9] py-2.5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-2.5 overflow-x-auto">
            {/* Sub Category Micro-Label */}
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 shrink-0 pr-1 select-none">
              {t('collection.subCategoryLabel')}:
            </span>

            {/* All in this Category Option */}
            <button
              type="button"
              onClick={() => onSelectSubCategory(null)}
              className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-xs transition-all whitespace-nowrap cursor-pointer border ${
                selectedSubCategory === null
                  ? 'bg-[#2B1810] text-white border-[#2B1810]'
                  : 'bg-[#FAF7F2] text-gray-600 border-[#EAE3D9] hover:text-[#2B1810] hover:border-gray-400'
              }`}
            >
              {t('collection.allSubCategories')}
            </button>

            {/* Individual Sub Categories */}
            {subCategories.map((sub) => (
              <button
                key={sub.slug}
                type="button"
                onClick={() =>
                  onSelectSubCategory(
                    selectedSubCategory === sub.slug ? null : sub.slug,
                  )
                }
                className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-xs transition-all whitespace-nowrap cursor-pointer border ${
                  selectedSubCategory === sub.slug
                    ? 'bg-[#2B1810] text-white border-[#2B1810]'
                    : 'bg-[#FAF7F2] text-gray-600 border-[#EAE3D9] hover:text-[#2B1810] hover:border-gray-400'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
