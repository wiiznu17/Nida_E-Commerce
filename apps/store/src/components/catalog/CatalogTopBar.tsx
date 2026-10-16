'use client';

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { DropdownSelect } from '@/components/ui';
import type { CatalogTopBarProps, SortOptionKey } from './catalogTypes';
import { SORT_OPTIONS } from './catalogConstants';

export function CatalogTopBar({
  title,
  searchQuery,
  totalCount,
  isFilterVisible,
  activeFilterCount,
  sortBy,
  onToggleFilter,
  onOpenMobileFilter,
  onSortChange,
}: CatalogTopBarProps) {
  const { t } = useLanguage();

  const sortOptions = SORT_OPTIONS.map((option) => ({
    id: option.id as SortOptionKey,
    label: t(option.i18nKey),
  }));

  return (
    <div className="sticky top-16 md:top-20 z-20 bg-white/95 backdrop-blur-md border-b border-brand-border transition-all duration-200">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-14 sm:h-16 flex items-center justify-between">
        {/* Left: Title or Search Query and Count */}
        <div className="flex items-baseline space-x-2.5 min-w-0">
          <h1 className="text-base sm:text-lg font-black tracking-tight text-brand-brown uppercase truncate">
            {title ? (
              title
            ) : searchQuery ? (
              <>
                {t('search.title')}: <span className="font-normal italic normal-case">&ldquo;{searchQuery}&rdquo;</span>
              </>
            ) : (
              t('search.allProducts')
            )}
          </h1>
          <span className="text-xs sm:text-sm font-medium text-gray-500 whitespace-nowrap">
            ({totalCount})
          </span>
        </div>

        {/* Right: Filter Toggle + Sort By */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Desktop Filter Toggle Button */}
          <button
            type="button"
            onClick={onToggleFilter}
            className="hidden lg:inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-bold tracking-wider uppercase text-brand-brown hover:bg-brand-warm-cream rounded-xs border border-brand-border transition-colors cursor-pointer"
          >
            <SlidersHorizontal size={14} />
            <span>
              {isFilterVisible ? t('search.hideFilters') : t('search.showFilters')}
            </span>
            {activeFilterCount > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-brand-brown text-white text-[9px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Mobile Filter Trigger Button */}
          <button
            type="button"
            onClick={onOpenMobileFilter}
            className="lg:hidden inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold tracking-wider uppercase text-brand-brown border border-brand-border rounded-xs hover:bg-brand-warm-cream cursor-pointer"
          >
            <SlidersHorizontal size={13} />
            <span>{t('search.filter')}</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand-brown text-white text-[9px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort By Dropdown using central DropdownSelect */}
          <DropdownSelect<SortOptionKey>
            value={sortBy}
            onChange={onSortChange}
            options={sortOptions}
            prefixLabel={`${t('search.sortBy')}:`}
            size="sm"
            menuClassName="w-52"
          />
        </div>
      </div>
    </div>
  );
}
