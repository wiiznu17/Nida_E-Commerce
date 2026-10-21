import { CreditCard, UserCheck, ShoppingCart, RefreshCcw, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { formatPrice } from '../../utils';
import type { AnalyticsOverviewDto } from '@repo/types';

interface DashboardKpiGridProps {
  metrics: AnalyticsOverviewDto;
}

export function DashboardKpiGrid({ metrics }: DashboardKpiGridProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* KPI 1: AOV */}
      <div className="bg-white border border-brand-border p-4 shadow-2xs hover:border-brand-brown transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">
            {t('dashboard.kpi.aovTitle')}
          </span>
          <div className="w-7 h-7 rounded-full bg-brand-cream text-brand-amber flex items-center justify-center">
            <CreditCard size={14} />
          </div>
        </div>
        <div className="text-xl font-black text-brand-brown font-mono">
          {formatPrice(metrics.aov)}
        </div>
        <div className="flex items-center text-xs font-bold text-emerald-700 mt-1">
          <TrendingUp size={12} className="mr-1" />
          <span>+{metrics.aovTrendPct}% {t('dashboard.kpi.vsLastPeriod')}</span>
        </div>
      </div>

      {/* KPI 2: Customer Retention */}
      <div className="bg-white border border-brand-border p-4 shadow-2xs hover:border-brand-brown transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">
            {t('dashboard.kpi.retentionTitle')}
          </span>
          <div className="w-7 h-7 rounded-full bg-brand-cream text-brand-brown flex items-center justify-center">
            <UserCheck size={14} />
          </div>
        </div>
        <div className="text-xl font-black text-brand-brown font-mono">
          {metrics.returningCustomerPct}%{' '}
          <span className="text-xs font-sans font-bold text-gray-500">
            {t('dashboard.kpi.returning')}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {metrics.newCustomerPct}% {t('dashboard.kpi.newCustomers')}
        </div>
      </div>

      {/* KPI 3: Cart Abandonment */}
      <div className="bg-white border border-brand-border p-4 shadow-2xs hover:border-brand-brown transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">
            {t('dashboard.kpi.cartAbandonmentTitle')}
          </span>
          <div className="w-7 h-7 rounded-full bg-amber-50 text-brand-amber flex items-center justify-center">
            <ShoppingCart size={14} />
          </div>
        </div>
        <div className="text-xl font-black text-brand-brown font-mono">
          {metrics.cartAbandonmentRate}%
        </div>
        <div className="text-xs font-bold text-emerald-700 mt-1">
          {t('dashboard.kpi.healthyBenchmark')}
        </div>
      </div>

      {/* KPI 4: Return Rate */}
      <div className="bg-white border border-brand-border p-4 shadow-2xs hover:border-brand-brown transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">
            {t('dashboard.kpi.returnRateTitle')}
          </span>
          <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <RefreshCcw size={14} />
          </div>
        </div>
        <div className="text-xl font-black text-brand-brown font-mono">
          {metrics.returnRate}%
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {t('dashboard.kpi.returnRateSub')}
        </div>
      </div>
    </div>
  );
}
