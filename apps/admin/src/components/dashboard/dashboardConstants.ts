import type {
  AnalyticsTimeframe,
  AnalyticsOverviewDto,
} from '@repo/types';

export const TIMEFRAME_OPTIONS: { id: AnalyticsTimeframe; labelKey: string }[] =
  [
    { id: 'today', labelKey: 'dashboard.timeframe.today' },
    { id: '7d', labelKey: 'dashboard.timeframe.week' },
    { id: '30d', labelKey: 'dashboard.timeframe.month' },
    { id: 'year', labelKey: 'dashboard.timeframe.year' },
  ];

export const INITIAL_OVERVIEW_METRICS: AnalyticsOverviewDto = {
  netRevenue: 0,
  grossRevenue: 0,
  totalDiscounts: 0,
  totalRefunds: 0,
  revenueTrendPct: 0,
  totalOrders: 0,
  completedOrders: 0,
  ordersTrendPct: 0,
  fulfillmentRate: 100,
  averageFulfillmentHours: 0,
  aov: 0,
  aovTrendPct: 0,
  returningCustomerPct: 0,
  newCustomerPct: 0,
  conversionRate: 0,
  cartAbandonmentRate: 0,
  returnRate: 0,
  pendingShipmentCount: 0,
  lowStockCount: 0,
  activeShoppersCount: 0,
  onTimeDispatchPct: 100,
  operationsScore: 100,
};

export const DEFAULT_OVERVIEW_METRICS = INITIAL_OVERVIEW_METRICS;
