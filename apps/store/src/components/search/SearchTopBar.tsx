'use client';

import React from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { SearchTopBarProps, FilterState } from './searchTypes';

export function SearchTopBar({
  query,
  totalCount,
  isFilterVisible,
  activeFilterCount,
  sortBy,
  onToggleFilter,
  onOpenMobileFilter,
  onSortChange,
}: SearchTopBarProps) {
  const { t } = useLanguage();

  return (
    <div className="sticky top-20 z-20 bg-white/95 backdrop-blur-md border-b border-[#EAE3D9] py-4">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Query Headline & Item Count */}
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#2B1810] flex items-center">
            {query ? (
              <>
                <span className="text-gray-400 mr-2 font-normal text-sm sm:text-base">
                  {t('search.resultsFor')}
                </span>
                &quot;{query}&quot;
              </>
            ) : (
              t('search.allProducts')
            )}
            <span className="ml-2.5 text-xs font-bold text-gray-500 tracking-normal">
              ({totalCount})
            </span>
          </h1>
        </div>

        {/* Action Controls: Hide/Show Filters & Sort By */}
        <div className="flex items-center space-x-3 self-end md:self-auto">
          {/* Desktop Toggle Filter Button */}
          <button
            type="button"
            onClick={onToggleFilter}
            className="hidden md:inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-[#2B1810] hover:text-[#D97706] bg-[#FAF7F2] hover:bg-[#F3EFEA] border border-[#EAE3D9] rounded-full transition-colors cursor-pointer"
          >
            <span>
              {isFilterVisible ? t('search.hideFilters') : t('search.showFilters')}
            </span>
            <SlidersHorizontal size={14} />
          </button>

          {/* Mobile Filter Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenMobileFilter}
            className="inline-flex md:hidden items-center space-x-2 px-3.5 py-1.5 text-xs font-bold text-[#2B1810] bg-[#FAF7F2] border border-[#EAE3D9] rounded-full transition-colors cursor-pointer"
          >
            <span>{t('search.filterBy')}</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#2B1810] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
            <SlidersHorizontal size={14} />
          </button>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as FilterState['sortBy'])}
              className="appearance-none bg-[#FAF7F2] hover:bg-[#F3EFEA] border border-[#EAE3D9] text-[#2B1810] text-xs font-bold rounded-full pl-4 pr-8 py-2 outline-none cursor-pointer transition-colors"
              aria-label={t('search.sortBy')}
            >
              <option value="featured">
                {t('search.sortBy')}: {t('search.sortFeatured')}
              </option>
              <option value="newest">
                {t('search.sortBy')}: {t('search.sortNewest')}
              </option>
              <option value="price-asc">
                {t('search.sortBy')}: {t('search.sortPriceAsc')}
              </option>
              <option value="price-desc">
                {t('search.sortBy')}: {t('search.sortPriceDesc')}
              </option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
