import type { AnalyticsTopProduct } from '@repo/types';
import { Package } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface AnalyticsTopProductsProps {
  products: AnalyticsTopProduct[];
  isLoading: boolean;
}

export function AnalyticsTopProducts({
  products,
  isLoading,
}: AnalyticsTopProductsProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="bg-white border border-brand-border rounded-xs p-6 animate-pulse">
        <div className="h-4 bg-stone-100 w-48 mb-6 rounded-xs" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-stone-50 rounded-xs" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-brand-border rounded-xs shadow-2xs overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="tracking-wider text-[11px] font-black uppercase text-stone-700">
          {t('analytics.products.title')}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-stone-50 border-b border-brand-border text-stone-500 uppercase tracking-wider text-[10px] font-semibold">
              <th className="py-3 px-4 w-16 text-center">{t('analytics.products.rank')}</th>
              <th className="py-3 px-4">{t('analytics.products.product')}</th>
              <th className="py-3 px-4 w-36">{t('analytics.products.sku')}</th>
              <th className="py-3 px-4 w-32 text-right">{t('analytics.products.unitsSold')}</th>
              <th className="py-3 px-4 w-36 text-right">{t('analytics.products.revenue')}</th>
              <th className="py-3 px-4 w-36 text-center">{t('analytics.products.stockAvailable')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-stone-400">
                  {t('analytics.products.empty')}
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const isOutOfStock = p.stockAvailable <= 0;
                const isLowStock = p.stockAvailable > 0 && p.stockAvailable <= 5;

                return (
                  <tr key={p.productId} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          p.rank === 1
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : p.rank === 2
                              ? 'bg-stone-200 text-stone-800'
                              : p.rank === 3
                                ? 'bg-orange-100 text-orange-900'
                                : 'text-stone-500'
                        }`}
                      >
                        {p.rank}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xs bg-stone-100 overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                          {p.thumbnailUrl ? (
                            <img
                              src={p.thumbnailUrl}
                              alt={p.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package size={16} className="text-stone-400" />
                          )}
                        </div>
                        <span className="font-medium text-brand-brown line-clamp-1">
                          {p.productName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-600 text-[11px]">
                      {p.skuCode}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-stone-800">
                      {p.unitsSold.toLocaleString('th-TH')}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-brand-brown">
                      ฿{p.revenue.toLocaleString('th-TH')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[11px] font-medium ${
                          isOutOfStock
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : isLowStock
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOutOfStock
                              ? 'bg-rose-600'
                              : isLowStock
                                ? 'bg-amber-600'
                                : 'bg-emerald-600'
                          }`}
                        />
                        {p.stockAvailable} units
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
