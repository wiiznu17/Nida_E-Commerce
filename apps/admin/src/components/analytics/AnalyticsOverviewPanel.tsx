import type { AnalyticsOverviewDto } from '@repo/types';
import {
  Clock,
  DollarSign,
  PackageCheck,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface AnalyticsOverviewPanelProps {
  overview: AnalyticsOverviewDto;
  isLoading: boolean;
}

export function AnalyticsOverviewPanel({
  overview,
  isLoading,
}: AnalyticsOverviewPanelProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-28 bg-white border border-brand-border rounded-xs p-4"
          />
        ))}
      </div>
    );
  }

  const renderTrend = (value: number) => {
    const isPositive = value >= 0;
    return (
      <span
        className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
          isPositive ? 'text-emerald-700' : 'text-rose-700'
        }`}
      >
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {isPositive ? `+${value}%` : `${value}%`}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Primary KPI Grid (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Revenue */}
        <div className="bg-white border border-brand-border rounded-xs p-4.5 shadow-2xs hover:border-brand-brown/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="tracking-wider text-[10px] font-black uppercase text-stone-400">
              {t('analytics.cards.netRevenue')}
            </span>
            <div className="w-7 h-7 rounded-full bg-stone-50 flex items-center justify-center text-brand-brown">
              <DollarSign size={14} />
            </div>
          </div>
          <div className="text-2xl font-mono font-bold text-brand-brown tracking-tight">
            ฿{overview.netRevenue.toLocaleString('th-TH')}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
            <span>{renderTrend(overview.revenueTrendPct)}</span>
            <span className="text-[11px] text-stone-400 font-mono">
              {t('analytics.cards.grossRevenue')}: ฿
              {overview.grossRevenue.toLocaleString('th-TH')}
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-brand-border rounded-xs p-4.5 shadow-2xs hover:border-brand-brown/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="tracking-wider text-[10px] font-black uppercase text-stone-400">
              {t('analytics.cards.totalOrders')}
            </span>
            <div className="w-7 h-7 rounded-full bg-stone-50 flex items-center justify-center text-brand-brown">
              <ShoppingBag size={14} />
            </div>
          </div>
          <div className="text-2xl font-mono font-bold text-brand-brown tracking-tight">
            {overview.totalOrders.toLocaleString('th-TH')}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
            <span>{renderTrend(overview.ordersTrendPct)}</span>
            <span className="text-[11px] text-stone-400 font-mono">
              {overview.completedOrders} completed
            </span>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white border border-brand-border rounded-xs p-4.5 shadow-2xs hover:border-brand-brown/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="tracking-wider text-[10px] font-black uppercase text-stone-400">
              {t('analytics.cards.aov')}
            </span>
            <div className="w-7 h-7 rounded-full bg-stone-50 flex items-center justify-center text-brand-brown">
              <DollarSign size={14} />
            </div>
          </div>
          <div className="text-2xl font-mono font-bold text-brand-brown tracking-tight">
            ฿{overview.aov.toLocaleString('th-TH')}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
            <span>{renderTrend(overview.aovTrendPct)}</span>
            <span className="text-[11px] text-stone-400">Per transaction</span>
          </div>
        </div>

        {/* Fulfillment Rate */}
        <div className="bg-white border border-brand-border rounded-xs p-4.5 shadow-2xs hover:border-brand-brown/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="tracking-wider text-[10px] font-black uppercase text-stone-400">
              {t('analytics.cards.fulfillmentRate')}
            </span>
            <div className="w-7 h-7 rounded-full bg-stone-50 flex items-center justify-center text-brand-brown">
              <PackageCheck size={14} />
            </div>
          </div>
          <div className="text-2xl font-mono font-bold text-brand-brown tracking-tight">
            {overview.fulfillmentRate}%
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
            <span className="text-emerald-700 text-[11px]">Healthy SLA</span>
            <span className="text-[11px] text-stone-400 font-mono">
              {overview.pendingShipmentCount} pending
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics (Horizontal Balance 8 + 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Secondary KPIs (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-brand-border rounded-xs p-5 shadow-2xs">
          <h3 className="tracking-wider text-[11px] font-black uppercase text-stone-700 mb-4 pb-2 border-b border-gray-100">
            Operational Diagnostics & Margins
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-stone-50/70 rounded-xs border border-stone-200/50">
              <span className="tracking-wider text-[9px] font-black uppercase text-stone-400 block mb-1">
                {t('analytics.cards.totalDiscounts')}
              </span>
              <span className="text-base font-semibold text-stone-800 font-mono">
                ฿{overview.totalDiscounts.toLocaleString('th-TH')}
              </span>
            </div>

            <div className="p-3 bg-stone-50/70 rounded-xs border border-stone-200/50">
              <span className="tracking-wider text-[9px] font-black uppercase text-stone-400 block mb-1">
                {t('analytics.cards.totalRefunds')}
              </span>
              <span className="text-base font-semibold text-stone-800 font-mono">
                ฿{overview.totalRefunds.toLocaleString('th-TH')}
              </span>
            </div>

            <div className="p-3 bg-stone-50/70 rounded-xs border border-stone-200/50">
              <span className="tracking-wider text-[9px] font-black uppercase text-stone-400 block mb-1">
                {t('analytics.cards.avgFulfillmentTime')}
              </span>
              <span className="text-base font-semibold text-stone-800 flex items-center gap-1 font-mono">
                <Clock size={13} className="text-stone-400" />
                {overview.averageFulfillmentHours} hrs
              </span>
            </div>

            <div className="p-3 bg-stone-50/70 rounded-xs border border-stone-200/50">
              <span className="tracking-wider text-[9px] font-black uppercase text-stone-400 block mb-1">
                {t('analytics.cards.returningCustomers')}
              </span>
              <span className="text-base font-semibold text-stone-800 font-mono">
                {overview.returningCustomerPct}%
              </span>
            </div>

            <div className="p-3 bg-stone-50/70 rounded-xs border border-stone-200/50">
              <span className="tracking-wider text-[9px] font-black uppercase text-stone-400 block mb-1">
                {t('analytics.cards.newCustomers')}
              </span>
              <span className="text-base font-semibold text-stone-800 font-mono">
                {overview.newCustomerPct}%
              </span>
            </div>

            <div className="p-3 bg-stone-50/70 rounded-xs border border-stone-200/50">
              <span className="tracking-wider text-[9px] font-black uppercase text-stone-400 block mb-1">
                {t('analytics.cards.returnRate')}
              </span>
              <span className="text-base font-semibold text-stone-800 font-mono">
                {overview.returnRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Live Velocity Summary Card (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-brand-border rounded-xs p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="tracking-wider text-[11px] font-black uppercase text-stone-700 mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
              <span>Fulfillment & Traffic Status</span>
              <Truck size={14} className="text-stone-400" />
            </h3>
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500">
                  {t('analytics.cards.pendingShipment')}
                </span>
                <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-xs font-mono">
                  {overview.pendingShipmentCount} orders
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500">Low Stock Alert SKUs</span>
                <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-xs font-mono">
                  {overview.lowStockCount} items
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500">Active Shopping Carts</span>
                <span className="font-semibold text-stone-800 font-mono">
                  {overview.activeShoppersCount} carts
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500">Estimated Conversion Rate</span>
                <span className="font-semibold text-stone-800 font-mono">
                  {overview.conversionRate}%
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-stone-400 flex items-center gap-1.5">
            <Users size={12} />
            <span>Refreshes dynamically with order volume</span>
          </div>
        </div>
      </div>
    </div>
  );
}
