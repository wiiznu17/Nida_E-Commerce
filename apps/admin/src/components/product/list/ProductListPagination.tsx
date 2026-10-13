import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

interface ProductListPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function ProductListPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: ProductListPaginationProps) {
  const { t, language } = useLanguage();

  if (totalItems === 0) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers
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

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-white border-t border-[#EAE3D9] text-xs">
      {/* Left: Range text & Page Size */}
      <div className="flex items-center space-x-3 text-gray-600">
        <span>
          {language === 'th' ? (
            <>
              {t('productList.showing')}{' '}
              <span className="font-bold text-[#2B1810]">
                {from}–{to}
              </span>{' '}
              {t('productList.of')}{' '}
              <span className="font-bold text-[#2B1810]">{totalItems}</span>{' '}
              {t('productList.items')}
            </>
          ) : (
            <>
              {t('productList.showing')}{' '}
              <span className="font-bold text-[#2B1810]">
                {from}–{to}
              </span>{' '}
              {t('productList.of')}{' '}
              <span className="font-bold text-[#2B1810]">{totalItems}</span>{' '}
              {t('productList.items')}
            </>
          )}
        </span>

        {/* Rows per page selector */}
        <div className="flex items-center space-x-1 pl-2 border-l border-gray-200">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 text-xs border border-gray-300 rounded-xs bg-[#FAF7F2] font-semibold text-gray-700 focus:outline-none focus:border-[#2B1810]"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-[11px] text-gray-400">
            {t('productList.perPage')}
          </span>
        </div>
      </div>

      {/* Right: Navigation Buttons */}
      <div className="flex items-center space-x-1">
        {/* Previous */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`inline-flex items-center justify-center p-1.5 rounded-xs border text-xs font-semibold transition-colors ${
            currentPage <= 1
              ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
              : 'border-[#EAE3D9] text-gray-700 bg-white hover:bg-[#FAF7F2] hover:border-[#2B1810] cursor-pointer'
          }`}
          title={t('productList.prev')}
        >
          <ChevronLeft size={14} />
        </button>

        {/* Number buttons */}
        {pageNumbers.map((p, idx) => {
          if (p === 'ellipsis') {
            return (
              <span key={`el-${idx}`} className="px-2 text-gray-400 select-none">
                …
              </span>
            );
          }

          const isActive = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`min-w-[28px] h-7 px-2 text-xs font-bold rounded-xs transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#2B1810] text-white shadow-2xs font-black'
                  : 'bg-white border border-[#EAE3D9] text-gray-700 hover:bg-[#FAF7F2] hover:border-gray-400'
              }`}
            >
              {p}
            </button>
          );
        })}

        {/* Next */}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`inline-flex items-center justify-center p-1.5 rounded-xs border text-xs font-semibold transition-colors ${
            currentPage >= totalPages
              ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
              : 'border-[#EAE3D9] text-gray-700 bg-white hover:bg-[#FAF7F2] hover:border-[#2B1810] cursor-pointer'
          }`}
          title={t('productList.next')}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
