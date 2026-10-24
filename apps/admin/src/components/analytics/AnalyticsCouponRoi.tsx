import type { AnalyticsCouponRoiSummary } from '@repo/types';
import { Award, DollarSign, Percent, Tag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface AnalyticsCouponRoiProps {
  summary: AnalyticsCouponRoiSummary;
  isLoading: boolean;
}

export function AnalyticsCouponRoi({
  summary,
  isLoading,
}: AnalyticsCouponRoiProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white border border-brand-border rounded-xs p-4" />
          ))}
        </div>
        <div className="h-48 bg-white border border-brand-border rounded-xs p-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-brand-border rounded-xs p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="tracking-wider text-[10px] font-black uppercase text-stone-400">
              {t('analytics.coupons.totalUsage')}
            </span>
            <div className="w-7 h-7 rounded-full bg-stone-50 flex items-center justify-center text-brand-brown">
              <Tag size={13} />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-brand-brown tracking-tight">
            {summary.totalUsage.toLocaleString('th-TH')}
          </div>
          <div className="mt-1 text-[11px] text-stone-400">Redeemed coupons</div>
        </div>

        <div className="bg-white border border-brand-border rounded-xs p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="tracking-wider text-[10px] font-black uppercase text-stone-400">
              {t('analytics.coupons.totalDiscount')}
            </span>
            <div className="w-7 h-7 rounded-full bg-stone-50 flex items-center justify-center text-brand-brown">
              <DollarSign size={13} />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-brand-brown tracking-tight">
            ฿{summary.totalDiscount.toLocaleString('th-TH')}
          </div>
          <div className="mt-1 text-[11px] text-stone-400">Total savings granted</div>
        </div>

        <div className="bg-white border border-brand-border rounded-xs p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="tracking-wider text-[10px] font-black uppercase text-stone-400">
              {t('analytics.coupons.netRevenueGenerated')}
            </span>
            <div className="w-7 h-7 rounded-full bg-stone-50 flex items-center justify-center text-brand-brown">
              <Award size={13} />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-brand-brown tracking-tight">
            ฿{summary.netRevenueGenerated.toLocaleString('th-TH')}
          </div>
          <div className="mt-1 text-[11px] text-stone-400">Paid order revenue</div>
        </div>

        <div className="bg-white border border-brand-border rounded-xs p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="tracking-wider text-[10px] font-black uppercase text-stone-400">
              {t('analytics.coupons.avgRoi')}
            </span>
            <div className="w-7 h-7 rounded-full bg-stone-50 flex items-center justify-center text-brand-brown">
              <Percent size={13} />
            </div>
          </div>
          <div className="text-2xl font-serif font-bold text-brand-brown tracking-tight">
            {summary.avgRoiPercent}%
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium">
            Positive promo return
          </div>
        </div>
      </div>

      {/* Coupon Detail Table */}
      <div className="bg-white border border-brand-border rounded-xs shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="tracking-wider text-[11px] font-black uppercase text-stone-700">
            {t('analytics.coupons.title')}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-brand-border text-stone-500 uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-3 px-4">{t('analytics.coupons.couponCode')}</th>
                <th className="py-3 px-4 w-32 text-center">{t('analytics.coupons.usageCount')}</th>
                <th className="py-3 px-4 w-40 text-right">{t('analytics.coupons.discountGiven')}</th>
                <th className="py-3 px-4 w-40 text-right">{t('analytics.coupons.salesGenerated')}</th>
                <th className="py-3 px-4 w-32 text-center">{t('analytics.coupons.roi')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {summary.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-400">
                    {t('analytics.coupons.empty')}
                  </td>
                </tr>
              ) : (
                summary.items.map((item) => (
                  <tr key={item.couponId} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-brand-brown bg-stone-100 px-2.5 py-1 rounded-xs text-[11px]">
                        {item.couponCode}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-stone-800">
                      {item.usageCount.toLocaleString('th-TH')}
                    </td>
                    <td className="py-3 px-4 text-right text-stone-600">
                      ฿{item.totalDiscount.toLocaleString('th-TH')}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-brand-brown">
                      ฿{item.netRevenue.toLocaleString('th-TH')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        +{item.roiPercent}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
