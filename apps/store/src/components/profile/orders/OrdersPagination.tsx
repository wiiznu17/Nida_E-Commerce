import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Pagination } from '@/components/ui';

interface OrdersPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function OrdersPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: OrdersPaginationProps) {
  const { t } = useLanguage();

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={onPageChange}
      itemUnitLabel={t('orderHistory.ordersUnit')}
    />
  );
}
