import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { DropdownSelect, SearchInput } from '@/components/ui';
import type {
  OrderHistoryStatusFilter,
  OrderHistorySortOption,
} from './orderHistoryTypes';

interface OrdersFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: OrderHistoryStatusFilter;
  onStatusFilterChange: (status: OrderHistoryStatusFilter) => void;
  statusCounts: Record<OrderHistoryStatusFilter, number>;
  sortBy: OrderHistorySortOption;
  onSortChange: (sort: OrderHistorySortOption) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export function OrdersFilterToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  statusCounts,
  sortBy,
  onSortChange,
  pageSize,
  onPageSizeChange,
}: OrdersFilterToolbarProps) {
  const { t } = useLanguage();

  const statuses: { key: OrderHistoryStatusFilter; label: string }[] = [
    { key: 'ALL', label: t('orderHistory.filterAll') },
    { key: 'PENDING', label: t('orderHistory.filterPending') },
    { key: 'PAID', label: t('orderHistory.filterPaid') },
    { key: 'PROCESSING', label: t('orderHistory.filterProcessing') },
    { key: 'SHIPPED', label: t('orderHistory.filterShipped') },
    { key: 'DELIVERED', label: t('orderHistory.filterDelivered') },
    { key: 'COMPLETED', label: t('orderHistory.filterCompleted') },
    { key: 'CANCELLED', label: t('orderHistory.filterCancelled') },
  ];

  const sortOptions = [
    { id: 'newest' as const, label: t('orderHistory.sortNewest') },
    { id: 'oldest' as const, label: t('orderHistory.sortOldest') },
    { id: 'amount_desc' as const, label: t('orderHistory.sortAmountHigh') },
    { id: 'amount_asc' as const, label: t('orderHistory.sortAmountLow') },
  ];

  const pageSizeOptions = [
    { id: '5', label: `5 ${t('orderHistory.itemsPerPage')}` },
    { id: '10', label: `10 ${t('orderHistory.itemsPerPage')}` },
    { id: '20', label: `20 ${t('orderHistory.itemsPerPage')}` },
  ];

  return (
    <div className="bg-white border border-gray-200 p-4 sm:p-5 mb-6 shadow-2xs space-y-4">
      {/* Top Row: Search Input + Sort & Page Size */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Bar using central SearchInput */}
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          onClear={() => onSearchChange('')}
          placeholder={t('orderHistory.searchPlaceholder')}
          className="flex-1 max-w-lg"
        />

        {/* Sort & Page Size Controls using central DropdownSelect */}
        <div className="flex items-center gap-2.5">
          <DropdownSelect<OrderHistorySortOption>
            value={sortBy}
            onChange={onSortChange}
            options={sortOptions}
            size="sm"
            menuClassName="w-44"
          />

          <DropdownSelect<string>
            value={String(pageSize)}
            onChange={(val) => onPageSizeChange(Number(val))}
            options={pageSizeOptions}
            size="sm"
            menuClassName="w-36"
          />
        </div>
      </div>

      {/* Bottom Row: Mobile-Friendly Horizontal Scrollable Status Pills */}
      <div className="pt-2 border-t border-gray-100 flex items-center overflow-x-auto scrollbar-none touch-pan-x gap-1.5 -mx-1 px-1">
        {statuses.map(({ key, label }) => {
          const count = statusCounts[key] ?? 0;
          const isActive = statusFilter === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onStatusFilterChange(key)}
              className={`shrink-0 inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-brown text-white shadow-2xs'
                  : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80 hover:text-brand-brown'
              }`}
            >
              <span>{label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive
                    ? 'bg-brand-yellow text-brand-brown font-black'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
