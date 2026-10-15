'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface CollectionEmptyStateProps {
  onResetFilters: () => void;
}

export function CollectionEmptyState({ onResetFilters }: CollectionEmptyStateProps) {
  const { language, t } = useLanguage();

  return (
    <div className="text-center py-24 space-y-4">
      <ShoppingBag size={48} strokeWidth={1} className="mx-auto text-gray-300" />
      <h3 className="text-xl font-bold text-[#2B1810]">
        {t('catalog.noProducts')}
      </h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto">
        {language === 'th'
          ? 'ไม่พบสินค้าที่ตรงกับตัวกรองที่เลือก ลองรีเซ็ตตัวกรองหรือเลือกดูหมวดหมู่อื่น'
          : "We couldn't find items matching your current filters. Try resetting the filters or check another category."}
      </p>
      <button
        type="button"
        onClick={onResetFilters}
        className="bg-[#2B1810] text-white text-xs font-black uppercase tracking-widest px-6 py-3 hover:bg-[#D97706] transition-colors cursor-pointer rounded-xs"
      >
        {t('catalog.resetFilters')}
      </button>
    </div>
  );
}
