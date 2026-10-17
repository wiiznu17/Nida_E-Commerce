'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
  itemUnitLabel?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = '',
  itemUnitLabel,
}: PaginationProps) {
  const { t } = useLanguage();

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

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
    <nav
      aria-label="Pagination"
      className={`pt-8 pb-4 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      {/* Item Range Counter */}
      <div className="text-xs text-gray-500 font-medium text-center sm:text-left">
        {t('pagination.showingRange')}{' '}
        <strong className="text-brand-brown font-mono font-bold">{startItem}</strong> -{' '}
        <strong className="text-brand-brown font-mono font-bold">{endItem}</strong>{' '}
        {t('pagination.ofTotal')}{' '}
        <strong className="text-brand-brown font-mono font-bold">{totalItems}</strong>{' '}
        {itemUnitLabel ?? t('pagination.items')}
      </div>

      {/* Page Navigation Controls */}
      <div className="flex items-center space-x-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="min-h-[38px] px-3.5 border border-brand-border bg-white text-xs font-bold uppercase tracking-wider text-brand-brown hover:bg-brand-warm-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors inline-flex items-center space-x-1 cursor-pointer"
          aria-label={t('pagination.prevPage')}
        >
          <ChevronLeft size={14} />
          <span className="hidden sm:inline">{t('pagination.prevPage')}</span>
        </button>

        {/* Mobile Compact Page Indicator */}
        <span className="text-xs font-bold text-brand-brown px-3 sm:hidden font-mono">
          {currentPage} / {totalPages}
        </span>

        {/* Desktop Page Numbers */}
        <div className="hidden sm:flex items-center space-x-1">
          {startPage > 1 && (
            <>
              <button
                type="button"
                onClick={() => onPageChange(1)}
                className="w-9 h-9 border border-brand-border bg-white text-xs font-mono font-bold text-gray-700 hover:border-brand-brown transition-colors cursor-pointer"
              >
                1
              </button>
              {startPage > 2 && (
                <span className="px-1 text-gray-400 text-xs font-mono select-none">...</span>
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
                  : 'bg-white border border-brand-border text-gray-700 hover:border-brand-brown hover:text-brand-brown'
              }`}
            >
              {p}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="px-1 text-gray-400 text-xs font-mono select-none">...</span>
              )}
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                className="w-9 h-9 border border-brand-border bg-white text-xs font-mono font-bold text-gray-700 hover:border-brand-brown transition-colors cursor-pointer"
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
          className="min-h-[38px] px-3.5 border border-brand-border bg-white text-xs font-bold uppercase tracking-wider text-brand-brown hover:bg-brand-warm-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors inline-flex items-center space-x-1 cursor-pointer"
          aria-label={t('pagination.nextPage')}
        >
          <span className="hidden sm:inline">{t('pagination.nextPage')}</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </nav>
  );
}
