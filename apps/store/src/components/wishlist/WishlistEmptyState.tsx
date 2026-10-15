'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { WishlistEmptyStateProps } from './wishlistTypes';

export function WishlistEmptyState({
  isFiltered,
  onClearFilters,
}: WishlistEmptyStateProps) {
  const { language, t } = useLanguage();

  if (isFiltered) {
    return (
      <div className="text-center py-20 bg-brand-warm-cream/60 border border-brand-border rounded-2xl p-8 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-white border border-brand-border flex items-center justify-center mx-auto mb-4 text-gray-400">
          <SlidersHorizontal size={24} strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-black uppercase text-brand-brown tracking-tight">
          {language === 'th'
            ? 'ไม่พบสินค้าตามตัวกรองที่เลือก'
            : 'NO ITEMS MATCH YOUR FILTERS'}
        </h2>
        <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
          {language === 'th'
            ? 'ลองปรับเปลี่ยนหรือล้างตัวกรองเพื่อดูรายการสินค้าทั้งหมดใน Wishlist ของคุณ'
            : 'Try modifying or clearing your filters to see all items in your wishlist.'}
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center justify-center bg-brand-brown text-white text-xs font-black uppercase tracking-widest px-6 py-3.5 hover:bg-brand-amber transition-colors cursor-pointer"
          >
            <span>{t('search.clearAll')}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-20 bg-brand-warm-cream/60 border border-brand-border rounded-2xl p-8 max-w-xl mx-auto">
      <div className="w-16 h-16 rounded-full bg-white border border-brand-border flex items-center justify-center mx-auto mb-4 text-gray-400">
        <Heart size={28} strokeWidth={1.5} />
      </div>
      <h2 className="text-lg font-black uppercase text-brand-brown tracking-tight">
        {t('wishlistPage.emptyTitle')}
      </h2>
      <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
        {t('wishlistPage.emptyDesc')}
      </p>
      <div className="mt-6">
        <Link
          href="/collections/all"
          className="inline-flex items-center justify-center bg-brand-brown text-white text-xs font-black uppercase tracking-widest px-6 py-3.5 hover:bg-brand-amber transition-colors"
        >
          <span>{t('wishlistPage.exploreCatalog')}</span>
          <ArrowRight size={14} className="ml-2" />
        </Link>
      </div>
    </div>
  );
}
