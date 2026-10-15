'use client';

import React, { useState } from 'react';
import { ChevronDown, Check, Grid3X3, LayoutGrid } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { CollectionControlBarProps } from './collectionTypes';

export function CollectionControlBar({
  sortBy,
  gridCols,
  totalCount,
  onSortChange,
  onToggleGridCols,
}: CollectionControlBarProps) {
  const { language, t } = useLanguage();
  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortOptions: {
    id: 'featured' | 'price-asc' | 'price-desc' | 'newest';
    label: string;
  }[] = [
    { id: 'featured', label: t('catalog.sortFeatured') },
    {
      id: 'newest',
      label:
        t('catalog.sortNewest') ||
        (language === 'th' ? 'มาใหม่ล่าสุด' : 'Newest'),
    },
    { id: 'price-asc', label: t('catalog.sortPriceAsc') },
    { id: 'price-desc', label: t('catalog.sortPriceDesc') },
  ];

  const currentSortLabel =
    sortOptions.find((o) => o.id === sortBy)?.label ||
    t('catalog.sortFeatured');

  return (
    <div className="border-b border-gray-200 bg-white sticky top-20 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left: Product Count Indicator */}
        <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
          {totalCount !== undefined && (
            <span>
              {totalCount} {language === 'th' ? 'รายการสินค้า' : 'PRODUCTS'}
            </span>
          )}
        </div>

        {/* Right: Grid Switcher & Sort By Dropdown */}
        <div className="flex items-center space-x-6">
          {/* Grid Layout Switcher (Desktop) */}
          <div className="hidden lg:flex items-center space-x-1 border-r border-gray-200 pr-6">
            <button
              type="button"
              onClick={() => onToggleGridCols(4)}
              className={`p-1.5 transition-colors cursor-pointer ${
                gridCols === 4
                  ? 'text-brand-brown'
                  : 'text-gray-300 hover:text-gray-500'
              }`}
              title="4 Columns"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              type="button"
              onClick={() => onToggleGridCols(3)}
              className={`p-1.5 transition-colors cursor-pointer ${
                gridCols === 3
                  ? 'text-brand-brown'
                  : 'text-gray-300 hover:text-gray-500'
              }`}
              title="3 Columns"
            >
              <Grid3X3 size={18} />
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center text-xs font-bold text-brand-brown hover:text-brand-amber uppercase tracking-wider py-2 cursor-pointer"
            >
              <span className="text-gray-400 mr-1.5">
                {t('catalog.sortBy')}:
              </span>
              <span>{currentSortLabel}</span>
              <ChevronDown size={14} className="ml-1" />
            </button>

            {isSortOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl py-1 z-40">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onSortChange(opt.id);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-gray-50 flex items-center justify-between cursor-pointer ${
                      sortBy === opt.id
                        ? 'text-brand-amber font-bold bg-brand-warm-cream'
                        : 'text-gray-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.id && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
