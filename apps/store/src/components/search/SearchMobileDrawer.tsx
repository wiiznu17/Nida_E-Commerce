'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { SearchMobileDrawerProps } from './searchTypes';

export function SearchMobileDrawer({
  isOpen,
  onClose,
  totalCount,
  children,
}: SearchMobileDrawerProps) {
  const { language, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col p-6 z-10 overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE3D9]">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#2B1810]">
            {t('search.filterBy')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-[#2B1810] cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 py-4">{children}</div>

        <div className="pt-4 border-t border-[#EAE3D9]">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-[#2B1810] text-white text-xs font-black uppercase tracking-widest hover:bg-[#D97706] transition-colors rounded-xs cursor-pointer"
          >
            {language === 'th' ? 'ดูสินค้า' : 'Apply Filters'} ({totalCount})
          </button>
        </div>
      </div>
    </div>
  );
}
