'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
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
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.id === sortBy)?.i18nKey
      ? t(SORT_OPTIONS.find((s) => s.id === sortBy)!.i18nKey)
      : t('search.featured');

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

          {/* Sort By Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="inline-flex items-center space-x-2 px-3 py-2 text-xs font-bold tracking-wider uppercase text-brand-brown hover:bg-brand-warm-cream rounded-xs border border-brand-border transition-colors cursor-pointer"
            >
              <span className="text-gray-500 hidden sm:inline">{t('search.sortBy')}:</span>
              <span>{currentSortLabel}</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-brand-border shadow-lg rounded-xs py-1 z-30 animate-in fade-in slide-in-from-top-1 duration-150">
                {SORT_OPTIONS.map((option) => {
                  const isSelected = sortBy === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        onSortChange(option.id as SortOptionKey);
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'font-black text-brand-brown bg-brand-warm-cream'
                          : 'font-medium text-gray-700 hover:bg-brand-warm-cream'
                      }`}
                    >
                      <span>{t(option.i18nKey)}</span>
                      {isSelected && <Check size={13} className="text-brand-brown" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
