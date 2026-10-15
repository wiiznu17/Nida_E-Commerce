'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { CatalogFilterSidebarProps } from './catalogTypes';
import { STANDARD_DEPARTMENTS, DEPARTMENT_LABELS, PRICE_OPTIONS } from './catalogConstants';

export function CatalogFilterSidebar({
  filters,
  filterOptions,
  activeFilterCount,
  onToggleDepartment,
  onToggleSubCategory,
  onPriceRangeChange,
  onToggleOnSale,
  onToggleNewArrivals,
  onClearAll,
}: CatalogFilterSidebarProps) {
  const { language, t } = useLanguage();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    gender: true,
    category: true,
    price: true,
    offers: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const departmentsToRender =
    filterOptions.departments.length > 0
      ? filterOptions.departments
      : (STANDARD_DEPARTMENTS as readonly string[]);

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
            {departmentsToRender.map((dept) => {
              const normalized = dept.toLowerCase();
              const isChecked = filters.departments.includes(normalized);
              const label =
                DEPARTMENT_LABELS[normalized]
                  ? language === 'th'
                    ? DEPARTMENT_LABELS[normalized].th
                    : DEPARTMENT_LABELS[normalized].en
                  : dept;

              return (
                <label
                  key={normalized}
                  className="flex items-center space-x-2.5 cursor-pointer text-xs font-medium text-gray-700 hover:text-[#2B1810]"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleDepartment(normalized)}
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
              {filterOptions.subCategories.map((cat) => {
                const isChecked = filters.subCategories.includes(cat.key);
                const label = language === 'th' ? cat.labelTh : cat.labelEn;
                return (
                  <label
                    key={cat.key}
                    className="flex items-center space-x-2.5 cursor-pointer text-xs font-medium text-gray-700 hover:text-[#2B1810]"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleSubCategory(cat.key)}
                      className="w-4 h-4 rounded border-gray-300 text-[#2B1810] focus:ring-[#2B1810] accent-[#2B1810]"
                    />
                    <span className="line-clamp-1">{label}</span>
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
            {PRICE_OPTIONS.map((option) => (
              <label
                key={option.id}
                className="flex items-center space-x-2.5 cursor-pointer text-xs font-medium text-gray-700 hover:text-[#2B1810]"
              >
                <input
                  type="radio"
                  name="catalogPriceRange"
                  checked={filters.priceRange === option.id}
                  onChange={() => {
                    if (filters.priceRange !== option.id) {
                      onPriceRangeChange(option.id);
                    }
                  }}
                  onClick={() => {
                    if (filters.priceRange === option.id) {
                      onPriceRangeChange(null);
                    }
                  }}
                  className="w-4 h-4 text-[#2B1810] focus:ring-[#2B1810] accent-[#2B1810]"
                />
                <span>{t(option.i18nKey)}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 4. Special Offers */}
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
