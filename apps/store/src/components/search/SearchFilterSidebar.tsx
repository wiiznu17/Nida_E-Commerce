'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { SearchFilterSidebarProps, FilterState } from './searchTypes';
import { DEPARTMENT_LABELS, COLOR_NAMES } from './searchConstants';

export function SearchFilterSidebar({
  filters,
  filterOptions,
  activeFilterCount,
  onToggleDepartment,
  onToggleSubCategory,
  onToggleColor,
  onPriceRangeChange,
  onToggleOnSale,
  onToggleNewArrivals,
  onClearAll,
}: SearchFilterSidebarProps) {
  const { language, t } = useLanguage();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    gender: true,
    category: true,
    price: true,
    color: true,
    offers: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-6 text-sm">
      {/* Active Filters Clear All */}
      {activeFilterCount > 0 && (
        <div className="pb-4 border-b border-[#EAE3D9] flex items-center justify-between">
          <span className="text-xs font-bold text-[#2B1810]">
            {activeFilterCount} {language === 'th' ? 'ตัวกรองที่เลือก' : 'Filters Active'}
          </span>
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center text-xs font-bold text-[#D97706] hover:underline cursor-pointer"
          >
            <RotateCcw size={12} className="mr-1" />
            {t('search.clearAll')}
          </button>
        </div>
      )}

      {/* 1. Department / Gender */}
      <div className="border-b border-[#EAE3D9] pb-5">
        <button
          type="button"
          onClick={() => toggleSection('gender')}
          className="w-full flex items-center justify-between text-xs font-black tracking-wider uppercase text-[#2B1810] py-1 text-left cursor-pointer"
        >
          <span>{t('search.gender')}</span>
          {openSections.gender ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {openSections.gender && (
          <div className="mt-3 space-y-2">
            {['women', 'men', 'kids', 'bags', 'shoes', 'home'].map((dept) => {
              const isChecked = filters.departments.includes(dept);
              const label =
                language === 'th'
                  ? DEPARTMENT_LABELS[dept]?.th || dept
                  : DEPARTMENT_LABELS[dept]?.en || dept;
              return (
                <label
                  key={dept}
                  className="flex items-center space-x-2.5 cursor-pointer text-xs font-medium text-gray-700 hover:text-[#2B1810]"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleDepartment(dept)}
                    className="w-4 h-4 rounded border-gray-300 text-[#2B1810] focus:ring-[#2B1810] accent-[#2B1810]"
                  />
                  <span>{label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Category / Sub-Category */}
      {filterOptions.subCategories.length > 0 && (
        <div className="border-b border-[#EAE3D9] pb-5">
          <button
            type="button"
            onClick={() => toggleSection('category')}
            className="w-full flex items-center justify-between text-xs font-black tracking-wider uppercase text-[#2B1810] py-1 text-left cursor-pointer"
          >
            <span>{t('search.category')}</span>
            {openSections.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {openSections.category && (
            <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
              {filterOptions.subCategories.map((sub) => {
                const isChecked = filters.subCategories.includes(sub.key);
                const label = language === 'th' ? sub.labelTh : sub.labelEn;
                return (
                  <label
                    key={sub.key}
                    className="flex items-center space-x-2.5 cursor-pointer text-xs font-medium text-gray-700 hover:text-[#2B1810]"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleSubCategory(sub.key)}
                      className="w-4 h-4 rounded border-gray-300 text-[#2B1810] focus:ring-[#2B1810] accent-[#2B1810]"
                    />
                    <span className="truncate">{label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. Shop by Price */}
      <div className="border-b border-[#EAE3D9] pb-5">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between text-xs font-black tracking-wider uppercase text-[#2B1810] py-1 text-left cursor-pointer"
        >
          <span>{t('search.price')}</span>
          {openSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {openSections.price && (
          <div className="mt-3 space-y-2">
            {[
              { id: 'under100', label: t('search.under100') },
              { id: '100-200', label: t('search.between100And200') },
              { id: 'over200', label: t('search.over200') },
            ].map((option) => (
              <label
                key={option.id}
                className="flex items-center space-x-2.5 cursor-pointer text-xs font-medium text-gray-700 hover:text-[#2B1810]"
              >
                <input
                  type="radio"
                  name="priceRange"
                  checked={filters.priceRange === option.id}
                  onChange={() =>
                    onPriceRangeChange(
                      filters.priceRange === option.id ? null : (option.id as FilterState['priceRange'])
                    )
                  }
                  onClick={() => {
                    if (filters.priceRange === option.id) {
                      onPriceRangeChange(null);
                    }
                  }}
                  className="w-4 h-4 text-[#2B1810] focus:ring-[#2B1810] accent-[#2B1810]"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 4. Color Swatches */}
      {filterOptions.colors.length > 0 && (
        <div className="border-b border-[#EAE3D9] pb-5">
          <button
            type="button"
            onClick={() => toggleSection('color')}
            className="w-full flex items-center justify-between text-xs font-black tracking-wider uppercase text-[#2B1810] py-1 text-left cursor-pointer"
          >
            <span>{t('search.color')}</span>
            {openSections.color ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {openSections.color && (
            <div className="mt-3 grid grid-cols-4 gap-2.5">
              {filterOptions.colors.map((colorHex) => {
                const isSelected = filters.colors.includes(colorHex);
                const colorInfo = COLOR_NAMES[colorHex];
                const displayName = colorInfo
                  ? language === 'th'
                    ? colorInfo.th
                    : colorInfo.en
                  : colorHex;

                return (
                  <button
                    key={colorHex}
                    type="button"
                    onClick={() => onToggleColor(colorHex)}
                    title={displayName}
                    className="flex flex-col items-center group py-1 cursor-pointer"
                  >
                    <div
                      className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-[#2B1810] ring-2 ring-[#2B1810] scale-110'
                          : 'border-gray-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: colorHex }}
                    >
                      {isSelected && (
                        <Check
                          size={12}
                          className={
                            colorHex === '#FFFFFF' || colorHex === '#F59E0B' || colorHex === '#D4B996'
                              ? 'text-black'
                              : 'text-white'
                          }
                        />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 line-clamp-1 text-center font-medium">
                      {displayName}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Special Offers */}
      <div className="pb-2">
        <button
          type="button"
          onClick={() => toggleSection('offers')}
          className="w-full flex items-center justify-between text-xs font-black tracking-wider uppercase text-[#2B1810] py-1 text-left cursor-pointer"
        >
          <span>{t('search.specialOffers')}</span>
          {openSections.offers ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {openSections.offers && (
          <div className="mt-3 space-y-2">
            <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-medium text-gray-700 hover:text-[#2B1810]">
              <input
                type="checkbox"
                checked={filters.onSale}
                onChange={(e) => onToggleOnSale(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#2B1810] focus:ring-[#2B1810] accent-[#2B1810]"
              />
              <span>{t('search.onSale')}</span>
            </label>
            <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-medium text-gray-700 hover:text-[#2B1810]">
              <input
                type="checkbox"
                checked={filters.newArrivals}
                onChange={(e) => onToggleNewArrivals(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#2B1810] focus:ring-[#2B1810] accent-[#2B1810]"
              />
              <span>{t('search.newArrivals')}</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
