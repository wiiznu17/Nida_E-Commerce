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
        <div className="bg-brand-warm-cream border-b border-brand-border py-3.5">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center space-x-3 overflow-x-auto">
            {/* Category Micro-Label */}
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-amber shrink-0 pr-1 select-none">
              {t('collection.categoryLabel')}:
            </span>

            {/* All Categories Option */}
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              className={`text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xs transition-all whitespace-nowrap cursor-pointer border ${
                selectedCategory === null
                  ? 'bg-brand-brown text-white border-brand-brown shadow-xs'
                  : 'bg-white text-brand-brown border-gray-200 hover:border-brand-brown'
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
                    ? 'bg-brand-brown text-white border-brand-brown shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:text-brand-brown hover:border-brand-brown'
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
        <div className="bg-white border-b border-brand-border py-2.5">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center space-x-2.5 overflow-x-auto">
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
                  ? 'bg-brand-brown text-white border-brand-brown'
                  : 'bg-brand-warm-cream text-gray-600 border-brand-border hover:text-brand-brown hover:border-gray-400'
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
                    ? 'bg-brand-brown text-white border-brand-brown'
                    : 'bg-brand-warm-cream text-gray-600 border-brand-border hover:text-brand-brown hover:border-gray-400'
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
