'use client';

import React from 'react';
import { Heart, SlidersHorizontal, Lock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { EmptyState } from '@/components/ui';
import type { WishlistEmptyStateProps } from './wishlistTypes';

export function WishlistEmptyState({
  isFiltered,
  onClearFilters,
  isUnauthenticated = false,
}: WishlistEmptyStateProps) {
  const { language, t } = useLanguage();
  const { openAuthDrawer } = useAuth();

  if (isUnauthenticated) {
    return (
      <EmptyState
        variant="card"
        icon={Lock}
        title={t('wishlistPage.loginRequiredTitle')}
        description={t('wishlistPage.loginRequiredDesc')}
        action={{
          label: t('wishlistPage.signInBtn'),
          onClick: () => openAuthDrawer('signin'),
        }}
        secondaryAction={{
          label: t('wishlistPage.exploreCatalog'),
          href: '/collections/women',
        }}
        className="max-w-xl mx-auto py-16"
      />
    );
  }

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
        href: '/collections/women',
      }}
      className="max-w-xl mx-auto py-16"
    />
  );
}
