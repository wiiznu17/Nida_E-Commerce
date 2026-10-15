import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { MARKETING_TAGS } from '@repo/types';
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
  onToggleTag,
  onClearAll,
}: CatalogFilterSidebarProps) {
  const { language, t } = useLanguage();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    gender: true,
    category: true,
    price: true,
    badges: true,
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
        <div className="pb-4 border-b border-brand-border flex items-center justify-between">
          <span className="text-xs font-bold text-brand-brown">
            {activeFilterCount} {language === 'th' ? 'ตัวกรองที่เลือก' : 'Filters Active'}
          </span>
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center text-xs font-bold text-brand-amber hover:underline cursor-pointer"
          >
            <RotateCcw size={12} className="mr-1" />
            {t('search.clearAll')}
          </button>
        </div>
      )}

      {/* 1. Department / Gender */}
      <div className="border-b border-brand-border pb-5">
        <button
          type="button"
          onClick={() => toggleSection('gender')}
          className="w-full flex items-center justify-between text-xs font-black tracking-wider uppercase text-brand-brown py-1 text-left cursor-pointer"
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
                  className="flex items-center space-x-2.5 cursor-pointer text-xs font-medium text-gray-700 hover:text-brand-brown"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleDepartment(normalized)}
                    className="w-4 h-4 rounded border-gray-300 text-brand-brown focus:ring-brand-brown accent-brand-brown"
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
        <div className="border-b border-brand-border pb-5">
          <button
            type="button"
            onClick={() => toggleSection('category')}
            className="w-full flex items-center justify-between text-xs font-black tracking-wider uppercase text-brand-brown py-1 text-left cursor-pointer"
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
                    className="flex items-center space-x-2.5 cursor-pointer text-xs font-medium text-gray-700 hover:text-brand-brown"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleSubCategory(cat.key)}
                      className="w-4 h-4 rounded border-gray-300 text-brand-brown focus:ring-brand-brown accent-brand-brown"
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
      <div className="border-b border-brand-border pb-5">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between text-xs font-black tracking-wider uppercase text-brand-brown py-1 text-left cursor-pointer"
        >
          <span>{t('search.price')}</span>
          {openSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {openSections.price && (
          <div className="mt-3 space-y-2">
            {PRICE_OPTIONS.map((option) => (
              <label
                key={option.id}
                className="flex items-center space-x-2.5 cursor-pointer text-xs font-medium text-gray-700 hover:text-brand-brown"
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
                  className="w-4 h-4 text-brand-brown focus:ring-brand-brown accent-brand-brown"
                />
                <span>{t(option.i18nKey)}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 4. Marketing Badges / Tags */}
      <div className="pb-2">
        <button
          type="button"
          onClick={() => toggleSection('badges')}
          className="w-full flex items-center justify-between text-xs font-black tracking-wider uppercase text-brand-brown py-1 text-left cursor-pointer"
        >
          <span>
            {t('search.productBadges') ??
              (language === 'th' ? 'ป้ายสินค้า' : 'Product Badges')}
          </span>
          {openSections.badges ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {openSections.badges && (
          <div className="mt-3 space-y-2">
            {MARKETING_TAGS.map((tagPreset) => {
              const isChecked = filters.tags.some(
                (t) =>
                  t.toUpperCase() === tagPreset.labelEn.toUpperCase() ||
                  t.toUpperCase() === tagPreset.key.toUpperCase(),
              );
              const label =
                language === 'th' ? tagPreset.labelTh : tagPreset.labelEn;

              return (
                <label
                  key={tagPreset.key}
                  className="flex items-center justify-between space-x-2.5 cursor-pointer text-xs font-medium text-gray-700 hover:text-brand-brown"
                >
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleTag(tagPreset.labelEn)}
                      className="w-4 h-4 rounded border-gray-300 text-brand-brown focus:ring-brand-brown accent-brand-brown"
                    />
                    <span>{label}</span>
                  </div>
                  <span
                    style={{
                      backgroundColor: tagPreset.badgeBg,
                      color: tagPreset.badgeText,
                      borderColor: tagPreset.badgeBorder,
                    }}
                    className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 border rounded-xs select-none"
                  >
                    {tagPreset.labelEn}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
