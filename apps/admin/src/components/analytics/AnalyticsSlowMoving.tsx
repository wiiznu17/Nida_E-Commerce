import type { AnalyticsSlowMovingProduct } from '@repo/types';
import { AlertCircle, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { DropdownSelect, Pagination } from '../ui';
import { SLOW_MOVING_DAY_OPTIONS } from './analyticsConstants';

interface AnalyticsSlowMovingProps {
  products: AnalyticsSlowMovingProduct[];
  days: number;
  onDaysChange: (days: number) => void;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function AnalyticsSlowMoving({
  products,
  days,
  onDaysChange,
  isLoading,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: AnalyticsSlowMovingProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white border border-brand-border rounded-xs shadow-2xs overflow-hidden">
      {/* Header and Filter */}
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="tracking-wider text-[11px] font-black uppercase text-stone-700">
            {t('analytics.slowMoving.title')}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500">
            {t('analytics.slowMoving.filterDays')}:
          </span>
          <div className="w-32">
            <DropdownSelect
              value={String(days)}
              onChange={(val) => onDaysChange(Number(val))}
              options={SLOW_MOVING_DAY_OPTIONS}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="p-6 space-y-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-stone-50 rounded-xs" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-brand-border text-stone-500 uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-3 px-4">{t('analytics.products.product')}</th>
                <th className="py-3 px-4 w-36">{t('analytics.products.sku')}</th>
                <th className="py-3 px-4 w-32">{t('analytics.departments.colDept')}</th>
                <th className="py-3 px-4 w-32 text-center">{t('analytics.slowMoving.currentStock')}</th>
                <th className="py-3 px-4 w-40 text-center">{t('analytics.slowMoving.daysSinceLastSale')}</th>
                <th className="py-3 px-4 w-36 text-right">{t('analytics.slowMoving.lastSaleDate')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    {t('analytics.slowMoving.empty')}
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isHighUrgency = p.daysSinceLastSale >= 60;

                  return (
                    <tr key={p.productId} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-medium text-brand-brown">
                          {p.productName}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-stone-600 text-[11px]">
                        {p.skuCode}
                      </td>
                      <td className="py-3 px-4 text-stone-600 font-medium">
                        {p.department}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-semibold bg-stone-100 text-stone-800 font-mono">
                          {p.currentStock} units
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xs text-[11px] font-medium font-mono ${
                            isHighUrgency
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isHighUrgency ? (
                            <AlertCircle size={11} className="text-rose-600" />
                          ) : (
                            <Clock size={11} className="text-amber-600" />
                          )}
                          {p.daysSinceLastSale} {t('analytics.slowMoving.days')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-stone-500 font-mono text-[11px]">
                        {p.lastSoldAt
                          ? new Date(p.lastSoldAt).toLocaleDateString()
                          : t('analytics.slowMoving.neverSold')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {!isLoading && totalItems > 0 && (
        <div className="p-4 border-t border-brand-border bg-stone-50/50">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            pageSizeOptions={[10, 20, 50]}
            itemLabel={t('analytics.products.product') || 'items'}
          />
        </div>
      )}
    </div>
  );
}
