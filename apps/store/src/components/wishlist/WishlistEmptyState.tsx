'use client';

import React from 'react';
import { Heart, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { EmptyState } from '@/components/ui';
import type { WishlistEmptyStateProps } from './wishlistTypes';

export function WishlistEmptyState({
  isFiltered,
  onClearFilters,
}: WishlistEmptyStateProps) {
  const { language, t } = useLanguage();

  if (isFiltered) {
    return (
      <EmptyState
        variant="card"
        icon={SlidersHorizontal}
        title={
          language === 'th'
            ? 'ไม่พบสินค้าตามตัวกรองที่เลือก'
            : 'NO ITEMS MATCH YOUR FILTERS'
        }
        description={
          language === 'th'
            ? 'ลองปรับเปลี่ยนหรือล้างตัวกรองเพื่อดูรายการสินค้าทั้งหมดใน Wishlist ของคุณ'
            : 'Try modifying or clearing your filters to see all items in your wishlist.'
        }
        action={{
          label: t('search.clearAll'),
          onClick: onClearFilters,
        }}
        className="max-w-xl mx-auto py-16"
      />
    );
  }

  return (
    <EmptyState
      variant="card"
      icon={Heart}
      title={t('wishlistPage.emptyTitle')}
      description={t('wishlistPage.emptyDesc')}
      action={{
        label: t('wishlistPage.exploreCatalog'),
        href: '/search',
      }}
      className="max-w-xl mx-auto py-16"
    />
  );
}
