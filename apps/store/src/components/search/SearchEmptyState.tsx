'use client';

import React from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { EmptyState } from '@/components/ui';

interface SearchEmptyStateProps {
  onClearAll: () => void;
}

export function SearchEmptyState({ onClearAll }: SearchEmptyStateProps) {
  const { language, t } = useLanguage();

  return (
    <EmptyState
      variant="card"
      icon={SearchIcon}
      title={t('search.noResults')}
      description={
        language === 'th'
          ? 'เราไม่พบสินค้าที่ตรงกับการค้นหาของคุณ ลองตรวจสอบคำสะกด หรือล้างตัวกรองเพื่อค้นหาอีกครั้ง'
          : 'We could not find anything matching your search term. Try checking your spelling or clearing active filters.'
      }
      action={{
        label: t('search.clearAll'),
        onClick: onClearAll,
      }}
      secondaryAction={{
        label: t('search.allProducts'),
        href: '/collections/all',
      }}
      className="max-w-xl mx-auto py-16"
    />
  );
}
