import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { formatPrice } from '../../utils';
import { InfoTooltip } from '../ui';
import type { AnalyticsOverviewDto } from '@repo/types';

interface DashboardHeroCardsProps {
  metrics: AnalyticsOverviewDto;
}

export function DashboardHeroCards({ metrics }: DashboardHeroCardsProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Hero 1: Net Revenue in Deep Espresso */}
      <div className="bg-brand-brown text-white p-5 sm:p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
        {/* Subtle decorative vector mesh line */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none">
          <svg
            viewBox="0 0 200 100"
            className="w-full h-full preserve-3d"
            fill="none"
          >
            <path
              d="M0 80 Q 50 20, 100 60 T 200 10"
              stroke="white"
              strokeWidth="4"
              fill="none"
            />
            <path
              d="M0 90 Q 60 40, 120 70 T 200 30"
              stroke="#D97706"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-200/80">
                {t('dashboard.hero.netRevenueTitle')}
              </span>
              <InfoTooltip
                title={t('dashboard.tooltips.netRevenueTitle')}
                description={t('dashboard.tooltips.netRevenueDesc')}
                formula={t('dashboard.tooltips.netRevenueFormula')}
                className="text-amber-200/60 hover:text-amber-200"
              />
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 text-amber-300 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>

          <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white font-mono break-all sm:break-normal">
              {formatPrice(metrics.netRevenue)}
            </h2>
            <div className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-xs border border-emerald-500/30">
              <TrendingUp size={12} className="mr-1" />
              <span>+{metrics.revenueTrendPct}%</span>
              <InfoTooltip
                title={t('dashboard.tooltips.revenueTrendTitle')}
                description={t('dashboard.tooltips.revenueTrendDesc')}
                formula={t('dashboard.tooltips.revenueTrendFormula')}
                className="ml-1 text-emerald-400/80 hover:text-emerald-300"
              />
            </div>
          </div>

          <p className="text-xs text-amber-100/70 mt-1">
            {t('dashboard.hero.netRevenueSub')}
          </p>
        </div>

        {/* Financial Breakdown Chips */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-2">
          <div>
            <div className="flex items-center space-x-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                {t('dashboard.hero.grossSales')}
              </span>
              <InfoTooltip
                title={t('dashboard.tooltips.grossSalesTitle')}
                description={t('dashboard.tooltips.grossSalesDesc')}
                formula={t('dashboard.tooltips.grossSalesFormula')}
                className="text-gray-400 hover:text-gray-200"
              />
            </div>
            <span className="text-xs font-bold font-mono text-gray-200">
              {formatPrice(metrics.grossRevenue)}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                {t('dashboard.hero.discounts')}
              </span>
              <InfoTooltip
                title={t('dashboard.tooltips.discountsTitle')}
                description={t('dashboard.tooltips.discountsDesc')}
                formula={t('dashboard.tooltips.discountsFormula')}
                className="text-gray-400 hover:text-gray-200"
              />
            </div>
            <span className="text-xs font-bold font-mono text-amber-300">
              -{formatPrice(metrics.totalDiscounts)}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                {t('dashboard.hero.refunds')}
              </span>
              <InfoTooltip
                title={t('dashboard.tooltips.refundsTitle')}
                description={t('dashboard.tooltips.refundsDesc')}
                formula={t('dashboard.tooltips.refundsFormula')}
                className="text-gray-400 hover:text-gray-200"
              />
            </div>
            <span className="text-xs font-bold font-mono text-rose-300">
              -{formatPrice(metrics.totalRefunds)}
            </span>
          </div>
        </div>
      </div>

      {/* Hero 2: Order Velocity & Fulfillment in Crisp Warm Card */}
      <div className="bg-white border border-brand-border p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                {t('dashboard.hero.ordersVelocityTitle')}
              </span>
              <InfoTooltip
                title={t('dashboard.tooltips.orderVelocityTitle')}
                description={t('dashboard.tooltips.orderVelocityDesc')}
                formula={t('dashboard.tooltips.orderVelocityFormula')}
              />
            </div>
            <div className="w-8 h-8 rounded-full bg-brand-cream text-brand-brown flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>

          <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-brand-brown font-mono">
              {metrics.totalOrders}{' '}
              <span className="text-sm font-sans font-bold text-gray-500">
                {t('dashboard.hero.ordersUnit')}
              </span>
            </h2>
            <div className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200">
              <TrendingUp size={12} className="mr-1" />
              <span>+{metrics.ordersTrendPct}%</span>
              <InfoTooltip
                title={t('dashboard.tooltips.ordersTrendTitle')}
                description={t('dashboard.tooltips.ordersTrendDesc')}
                formula={t('dashboard.tooltips.ordersTrendFormula')}
                className="ml-1 text-emerald-700/80 hover:text-emerald-900"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-1">
            {t('dashboard.hero.ordersVelocitySub')}
          </p>
        </div>

        {/* Operations Execution Indicators */}
        <div className="mt-6 pt-4 border-t border-brand-border grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <div className="flex items-center text-[10px] font-black uppercase tracking-wider text-gray-500">
              <CheckCircle size={12} className="text-emerald-600 mr-1" />
              <span>{t('dashboard.hero.fulfillmentRate')}</span>
              <InfoTooltip
                title={t('dashboard.tooltips.fulfillmentRateTitle')}
                description={t('dashboard.tooltips.fulfillmentRateDesc')}
                formula={t('dashboard.tooltips.fulfillmentRateFormula')}
                className="ml-1"
              />
            </div>
            <div className="text-sm font-black text-brand-brown font-mono">
              {metrics.fulfillmentRate}%
            </div>
            <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full"
                style={{ width: `${metrics.fulfillmentRate}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center text-[10px] font-black uppercase tracking-wider text-gray-500">
              <Clock size={12} className="text-brand-amber mr-1" />
              <span>{t('dashboard.hero.avgFulfillmentTime')}</span>
              <InfoTooltip
                title={t('dashboard.tooltips.avgFulfillmentTitle')}
                description={t('dashboard.tooltips.avgFulfillmentDesc')}
                formula={t('dashboard.tooltips.avgFulfillmentFormula')}
                className="ml-1"
              />
            </div>
            <div className="text-sm font-black text-brand-brown font-mono">
              {metrics.averageFulfillmentHours} {t('dashboard.hero.hours')}
            </div>
            <div className="text-[10px] text-gray-400">
              {metrics.averageFulfillmentHours <= 0
                ? t('dashboard.hero.dispatchNoData')
                : metrics.averageFulfillmentHours <= 24
                  ? t('dashboard.hero.dispatchFaster').replace(
                      '{pct}',
                      String(
                        Math.round(
                          ((24 - metrics.averageFulfillmentHours) / 24) * 100,
                        ),
                      ),
                    )
                  : t('dashboard.hero.dispatchSlower').replace(
                      '{pct}',
                      String(
                        Math.round(
                          ((metrics.averageFulfillmentHours - 24) / 24) * 100,
                        ),
                      ),
                    )}
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <Link
              to="/admin/orders"
              className="inline-flex items-center justify-between text-xs font-bold text-brand-amber hover:text-brand-brown bg-brand-cream/60 hover:bg-brand-cream px-2.5 py-1.5 transition-colors border border-brand-border"
            >
              <span>{t('dashboard.hero.goToFulfillment')}</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
