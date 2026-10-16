import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

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

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate numbered pages for desktop view
  const pages: number[] = [];
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = startPage + maxButtons - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Item range count */}
      <div className="text-xs text-gray-500 font-medium text-center sm:text-left">
        {t('orderHistory.showingRange')}{' '}
        <strong className="text-brand-brown font-mono">{startItem}</strong> -{' '}
        <strong className="text-brand-brown font-mono">{endItem}</strong>{' '}
        {t('orderHistory.ofTotal')}{' '}
        <strong className="text-brand-brown font-mono">{totalItems}</strong>{' '}
        {t('orderHistory.ordersUnit')}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="min-h-[38px] px-3 border border-gray-300 text-xs font-bold uppercase text-brand-brown hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center space-x-1 cursor-pointer"
        >
          <ChevronLeft size={14} />
          <span className="hidden sm:inline">{t('orderHistory.prevPage')}</span>
        </button>

        {/* Mobile Compact Page Display */}
        <span className="text-xs font-bold text-brand-brown px-3 sm:hidden font-mono">
          {currentPage} / {totalPages}
        </span>

        {/* Desktop Number Buttons */}
        <div className="hidden sm:flex items-center space-x-1">
          {startPage > 1 && (
            <>
              <button
                type="button"
                onClick={() => onPageChange(1)}
                className="w-9 h-9 border border-gray-300 text-xs font-mono font-bold text-gray-700 hover:border-brand-brown transition-colors cursor-pointer"
              >
                1
              </button>
              {startPage > 2 && (
                <span className="px-1 text-gray-400 text-xs font-mono">...</span>
              )}
            </>
          )}

          {pages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 text-xs font-mono font-bold transition-all cursor-pointer ${
                currentPage === p
                  ? 'bg-brand-brown text-white border border-brand-brown shadow-2xs'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-brand-brown'
              }`}
            >
              {p}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="px-1 text-gray-400 text-xs font-mono">...</span>
              )}
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                className="w-9 h-9 border border-gray-300 text-xs font-mono font-bold text-gray-700 hover:border-brand-brown transition-colors cursor-pointer"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="min-h-[38px] px-3 border border-gray-300 text-xs font-bold uppercase text-brand-brown hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center space-x-1 cursor-pointer"
        >
          <span className="hidden sm:inline">{t('orderHistory.nextPage')}</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
