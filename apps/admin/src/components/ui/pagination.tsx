import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { DropdownSelect } from './select';
import { cn } from 'cn';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  itemLabel?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className,
  itemLabel,
}: PaginationProps) {
  const { t } = useLanguage();

  if (totalItems === 0) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const displayItemsLabel =
    itemLabel ?? (t('pagination.items') || t('productList.items') || 'items');

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-white border-t border-brand-border text-xs',
        className,
      )}
    >
      {/* Left: Range text & Page Size Selector */}
      <div className="flex items-center space-x-3 text-gray-600">
        <span>
          {t('pagination.showing') || t('productList.showing') || 'Showing'}{' '}
          <span className="font-bold text-brand-brown">
            {from}–{to}
          </span>{' '}
          {t('pagination.of') || t('productList.of') || 'of'}{' '}
          <span className="font-bold text-brand-brown">{totalItems}</span>{' '}
          {displayItemsLabel}
        </span>

        {/* Rows per page selector */}
        {onPageSizeChange && (
          <div className="flex items-center space-x-1 pl-2 border-l border-gray-200">
            <DropdownSelect
              value={String(pageSize)}
              onChange={(val) => onPageSizeChange(Number(val))}
              options={pageSizeOptions.map((opt) => ({
                value: String(opt),
                label: String(opt),
              }))}
              className="w-16 h-7.5 px-2 bg-brand-cream text-xs font-semibold"
            />
            <span className="text-[11px] text-gray-400">
              {t('pagination.perPage') ||
                t('productList.perPage') ||
                'per page'}
            </span>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Buttons */}
      <div className="flex items-center space-x-1">
        {/* Previous Button */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={cn(
            'inline-flex items-center justify-center p-1.5 rounded-xs border text-xs font-semibold transition-colors',
            currentPage <= 1
              ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
              : 'border-brand-border text-gray-700 bg-white hover:bg-brand-cream hover:border-brand-brown cursor-pointer',
          )}
          title={t('pagination.prev') || t('productList.prev') || 'Previous'}
        >
          <ChevronLeft size={14} />
        </button>

        {/* Numeric Page Buttons */}
        {pageNumbers.map((p, idx) => {
          if (p === 'ellipsis') {
            return (
              <span
                key={`el-${idx}`}
                className="px-2 text-gray-400 select-none"
              >
                ...
              </span>
            );
          }

          const isCurrent = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={cn(
                'min-w-7 h-7 px-2 rounded-xs border text-xs font-semibold transition-all cursor-pointer',
                isCurrent
                  ? 'bg-brand-brown border-brand-brown text-white font-black shadow-2xs'
                  : 'border-brand-border bg-white text-gray-700 hover:bg-brand-cream hover:border-brand-brown',
              )}
            >
              {p}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={cn(
            'inline-flex items-center justify-center p-1.5 rounded-xs border text-xs font-semibold transition-colors',
            currentPage >= totalPages
              ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
              : 'border-brand-border text-gray-700 bg-white hover:bg-brand-cream hover:border-brand-brown cursor-pointer',
          )}
          title={t('pagination.next') || t('productList.next') || 'Next'}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
