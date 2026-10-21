import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { SearchInput, DropdownSelect } from '../ui';
import { useLanguage } from '../../context/LanguageContext';
import type { AdminReturnStatusCounts } from '@repo/types';

export type ReturnFilterTab =
  'ALL' | 'REQUESTED' | 'APPROVED' | 'SHIPPED' | 'COMPLETED' | 'REJECTED';

interface ReturnFilterCardProps {
  statusFilter: ReturnFilterTab;
  statusCounts: AdminReturnStatusCounts;
  totalItems: number;
  itemsCount: number;
  searchInput: string;
  sortByInput: 'newest' | 'oldest';
  onStatusChange: (status: ReturnFilterTab) => void;
  onSearchInputChange: (val: string) => void;
  onSortByChange: (val: 'newest' | 'oldest') => void;
  onSubmit: (e?: React.FormEvent) => void;
  onReset: () => void;
}

export const ReturnFilterCard: React.FC<ReturnFilterCardProps> = ({
  statusFilter,
  statusCounts,
  totalItems,
  itemsCount,
  searchInput,
  sortByInput,
  onStatusChange,
  onSearchInputChange,
  onSortByChange,
  onSubmit,
  onReset,
}) => {
  const { t, language } = useLanguage();

  const tabs = [
    {
      id: 'ALL' as const,
      label: t('returnsPage.filterAll'),
      count: statusCounts.all,
      activeBg: 'bg-[#2B1810]',
      dotBg: '',
    },
    {
      id: 'REQUESTED' as const,
      label: t('returnsPage.filterRequested'),
      count: statusCounts.requested,
      activeBg: 'bg-amber-600',
      dotBg: 'bg-amber-500',
    },
    {
      id: 'APPROVED' as const,
      label: t('returnsPage.filterApproved'),
      count: statusCounts.approved,
      activeBg: 'bg-blue-600',
      dotBg: 'bg-blue-500',
    },
    {
      id: 'SHIPPED' as const,
      label: t('returnsPage.filterShipped'),
      count: statusCounts.shipped,
      activeBg: 'bg-purple-700',
      dotBg: 'bg-purple-500',
    },
    {
      id: 'COMPLETED' as const,
      label: t('returnsPage.filterCompleted'),
      count: statusCounts.completed,
      activeBg: 'bg-emerald-700',
      dotBg: 'bg-emerald-500',
    },
    {
      id: 'REJECTED' as const,
      label: t('returnsPage.filterRejected'),
      count: statusCounts.rejected,
      activeBg: 'bg-stone-700',
      dotBg: 'bg-stone-400',
    },
  ];

  return (
    <div className="bg-white border border-brand-border p-5 rounded-xs space-y-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-4">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusChange(tab.id)}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xs whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? `${tab.activeBg} text-white shadow-2xs font-black`
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                {tab.dotBg && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : tab.dotBg}`}
                  />
                )}
                <span>
                  {tab.label} ({tab.count})
                </span>
              </button>
            );
          })}
        </div>
        <div className="text-[11px] font-bold text-gray-500">
          {language === 'th'
            ? `แสดง ${itemsCount} จากทั้งหมด ${totalItems} คำขอ`
            : `Showing ${itemsCount} of ${totalItems} requests`}
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          <div className="lg:col-span-7">
            <SearchInput
              value={searchInput}
              onChange={onSearchInputChange}
              placeholder={t('returnsPage.searchPlaceholder')}
            />
          </div>
          <div className="lg:col-span-3">
            <DropdownSelect
              value={sortByInput}
              onChange={(val) => onSortByChange(val as 'newest' | 'oldest')}
              options={[
                { value: 'newest', label: t('orders.sortNewest') },
                { value: 'oldest', label: t('orders.sortOldest') },
              ]}
            />
          </div>
          <div className="flex items-center space-x-1.5 sm:col-span-2 lg:col-span-2">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center space-x-1.5 bg-brand-brown hover:bg-brand-dark-brown text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-2xs cursor-pointer"
            >
              <Search size={13} />
              <span>{t('orders.searchBtn')}</span>
            </button>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 bg-brand-cream hover:bg-brand-border border border-brand-border rounded-xs transition-colors cursor-pointer"
              title={t('orders.resetBtn')}
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
