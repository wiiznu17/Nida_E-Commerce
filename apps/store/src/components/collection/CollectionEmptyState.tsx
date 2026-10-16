'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { EmptyState } from '@/components/ui';

interface CollectionEmptyStateProps {
  onResetFilters: () => void;
}

export function CollectionEmptyState({ onResetFilters }: CollectionEmptyStateProps) {
  const { language, t } = useLanguage();

  return (
    <EmptyState
      icon={ShoppingBag}
      title={t('catalog.noProducts')}
      description={
        language === 'th'
          ? 'ไม่พบสินค้าที่ตรงกับตัวกรองที่เลือก ลองรีเซ็ตตัวกรองหรือเลือกดูหมวดหมู่อื่น'
          : "We couldn't find items matching your current filters. Try resetting the filters or check another category."
      }
      action={{
        label: t('catalog.resetFilters'),
        onClick: onResetFilters,
      }}
      className="py-24"
    />
  );
}
