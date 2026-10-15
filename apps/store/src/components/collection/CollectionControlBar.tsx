'use client';

import React, { useState } from 'react';
import { ChevronDown, Check, Grid3X3, LayoutGrid } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { CollectionControlBarProps } from './collectionTypes';
import { COLOR_PRESETS } from './collectionConstants';

export function CollectionControlBar({
  selectedColor,
  sortBy,
  gridCols,
  onSelectColor,
  onSortChange,
  onToggleGridCols,
}: CollectionControlBarProps) {
  const { language, t } = useLanguage();
  const [activeDropdown, setActiveDropdown] = useState<'color' | 'sort' | null>(null);

  const sortOptions: {
    id: 'featured' | 'price-asc' | 'price-desc' | 'newest';
    label: string;
  }[] = [
    { id: 'featured', label: t('catalog.sortFeatured') },
    { id: 'newest', label: t('catalog.sortNewest') || (language === 'th' ? 'มาใหม่ล่าสุด' : 'Newest') },
    { id: 'price-asc', label: t('catalog.sortPriceAsc') },
    { id: 'price-desc', label: t('catalog.sortPriceDesc') },
  ];

  const currentSortLabel =
    sortOptions.find((o) => o.id === sortBy)?.label || t('catalog.sortFeatured');

  return (
    <div className="border-b border-gray-200 bg-white sticky top-20 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left: Filter dropdown buttons */}
        <div className="flex items-center space-x-6 text-xs font-bold text-[#2B1810]">
          {/* Color Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'color' ? null : 'color')}
              className="flex items-center hover:text-[#D97706] uppercase tracking-wider py-2 cursor-pointer"
            >
              {language === 'th' ? 'เลือกสี' : 'COLOR'}{' '}
              {selectedColor && <span className="ml-1 text-[#D97706] font-black">•</span>}
              <ChevronDown size={14} className="ml-1" />
            </button>
            {activeDropdown === 'color' && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl p-3 z-40">
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => {
                        onSelectColor(selectedColor === col ? null : col);
                        setActiveDropdown(null);
                      }}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                        selectedColor === col
                          ? 'border-[#2B1810] scale-110 ring-2 ring-[#D97706]'
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: col }}
                    >
                      {selectedColor === col && (
                        <Check
                          size={12}
                          className={
                            col === '#FFFFFF' || col === '#F59E0B' || col === '#D4B996'
                              ? 'text-black'
                              : 'text-white'
                          }
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Grid Switcher & Sort By Dropdown */}
        <div className="flex items-center space-x-6">
          {/* Grid Layout Switcher (Desktop) */}
          <div className="hidden lg:flex items-center space-x-1 border-r border-gray-200 pr-6">
            <button
              type="button"
              onClick={() => onToggleGridCols(4)}
              className={`p-1.5 transition-colors cursor-pointer ${
                gridCols === 4 ? 'text-[#2B1810]' : 'text-gray-300 hover:text-gray-500'
              }`}
              title="4 Columns"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              type="button"
              onClick={() => onToggleGridCols(3)}
              className={`p-1.5 transition-colors cursor-pointer ${
                gridCols === 3 ? 'text-[#2B1810]' : 'text-gray-300 hover:text-gray-500'
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
              onClick={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')}
              className="flex items-center text-xs font-bold text-[#2B1810] hover:text-[#D97706] uppercase tracking-wider py-2 cursor-pointer"
            >
              <span className="text-gray-400 mr-1.5">{t('catalog.sortBy')}:</span>
              <span>{currentSortLabel}</span>
              <ChevronDown size={14} className="ml-1" />
            </button>

            {activeDropdown === 'sort' && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl py-1 z-40">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onSortChange(opt.id);
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-gray-50 flex items-center justify-between cursor-pointer ${
                      sortBy === opt.id ? 'text-[#D97706] font-bold bg-[#FAF7F2]' : 'text-gray-700'
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
