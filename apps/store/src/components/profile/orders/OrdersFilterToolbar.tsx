import React from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
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
    { key: 'CANCELLED', label: t('orderHistory.filterCancelled') },
  ];

  return (
    <div className="bg-white border border-gray-200 p-4 sm:p-5 mb-6 shadow-2xs space-y-4">
      {/* Top Row: Search Input + Sort & Page Size */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-lg">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('orderHistory.searchPlaceholder')}
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50/70 border border-gray-300 text-xs text-brand-brown placeholder-gray-400 focus:bg-white focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort & Page Size Controls */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={sortBy}
              onChange={(e) =>
                onSortChange(e.target.value as OrderHistorySortOption)
              }
              className="w-full sm:w-auto appearance-none bg-white border border-gray-300 pl-3 pr-8 py-2.5 text-xs font-bold text-brand-brown focus:border-brand-brown focus:outline-none cursor-pointer"
            >
              <option value="newest">{t('orderHistory.sortNewest')}</option>
              <option value="oldest">{t('orderHistory.sortOldest')}</option>
              <option value="amount_desc">{t('orderHistory.sortAmountHigh')}</option>
              <option value="amount_asc">{t('orderHistory.sortAmountLow')}</option>
            </select>
            <ArrowUpDown
              size={12}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-white border border-gray-300 px-3 py-2.5 text-xs font-bold text-brand-brown focus:border-brand-brown focus:outline-none cursor-pointer"
          >
            <option value={5}>5 {t('orderHistory.itemsPerPage')}</option>
            <option value={10}>10 {t('orderHistory.itemsPerPage')}</option>
            <option value={20}>20 {t('orderHistory.itemsPerPage')}</option>
          </select>
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
