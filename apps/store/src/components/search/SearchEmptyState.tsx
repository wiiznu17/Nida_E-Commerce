'use client';

import React from 'react';
import Link from 'next/link';
import { Search as SearchIcon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface SearchEmptyStateProps {
  onClearAll: () => void;
}

export function SearchEmptyState({ onClearAll }: SearchEmptyStateProps) {
  const { language, t } = useLanguage();

  return (
    <div className="text-center py-20 bg-[#FAF7F2]/60 border border-[#EAE3D9] rounded-2xl p-8 max-w-xl mx-auto">
      <SearchIcon size={44} strokeWidth={1.5} className="mx-auto text-gray-400 mb-3" />
      <h3 className="text-lg font-black uppercase text-[#2B1810] tracking-tight">
        {t('search.noResults')}
      </h3>
      <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
        {language === 'th'
          ? 'เราไม่พบสินค้าที่ตรงกับการค้นหาของคุณ ลองตรวจสอบคำสะกด หรือล้างตัวกรองเพื่อค้นหาอีกครั้ง'
          : 'We could not find anything matching your search term. Try checking your spelling or clearing active filters.'}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onClearAll}
          className="px-5 py-2.5 bg-[#2B1810] hover:bg-[#D97706] text-white text-xs font-black uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
        >
          {t('search.clearAll')}
        </button>
        <Link
          href="/collections/all"
          className="px-5 py-2.5 bg-white border border-[#2B1810] text-[#2B1810] hover:bg-[#FAF7F2] text-xs font-black uppercase tracking-wider rounded-xs transition-colors"
        >
          {t('search.allProducts')}
        </Link>
      </div>
    </div>
  );
}
