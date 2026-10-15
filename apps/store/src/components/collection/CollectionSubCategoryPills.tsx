'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import type { CollectionSubCategoryPillsProps } from './collectionTypes';

export function CollectionSubCategoryPills({
  subCategories,
  selectedSubCategory,
  totalCount,
  onSelectSubCategory,
}: CollectionSubCategoryPillsProps) {
  const { language } = useLanguage();

  if (subCategories.length === 0) return null;

  return (
    <div className="bg-[#FAF7F2] border-b border-[#EAE3D9] py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => onSelectSubCategory(null)}
          className={`text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xs transition-colors whitespace-nowrap cursor-pointer ${
            selectedSubCategory === null
              ? 'bg-[#2B1810] text-white'
              : 'bg-white text-[#2B1810] hover:bg-gray-200'
          }`}
        >
          {language === 'th' ? 'ทั้งหมด' : 'ALL'} ({totalCount})
        </button>
        {subCategories.map((sub) => (
          <button
            key={sub.key}
            type="button"
            onClick={() =>
              onSelectSubCategory(selectedSubCategory === sub.key ? null : sub.key)
            }
            className={`text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xs transition-colors whitespace-nowrap cursor-pointer ${
              selectedSubCategory === sub.key
                ? 'bg-[#2B1810] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>
    </div>
  );
}
