import React from 'react';
import { Grid3X3, LayoutGrid } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { DropdownSelect } from '@/components/ui';
import type { CollectionControlBarProps } from './collectionTypes';

export function CollectionControlBar({
  sortBy,
  gridCols,
  totalCount,
  onSortChange,
  onToggleGridCols,
}: CollectionControlBarProps) {
  const { language, t } = useLanguage();

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

  return (
    <div className="border-b border-gray-200 bg-white sticky top-20 z-30 shadow-2xs font-sans">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-14 flex items-center justify-between">
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
          <DropdownSelect
            value={sortBy}
            onChange={(val) =>
              onSortChange(val as 'featured' | 'price-asc' | 'price-desc' | 'newest')
            }
            options={sortOptions}
            prefixLabel={t('catalog.sortBy')}
            variant="ghost"
            size="md"
          />
        </div>
      </div>
    </div>
  );
}
