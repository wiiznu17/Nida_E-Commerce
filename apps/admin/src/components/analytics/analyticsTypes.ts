import type { AnalyticsPageTimeframe } from '@repo/types';

export type AnalyticsTab =
  | 'overview'
  | 'department'
  | 'products'
  | 'slow-moving'
  | 'coupon'
  | 'export';

export interface DateRangeState {
  startDate: string;
  endDate: string;
}

export interface AnalyticsFilterState {
  activeTab: AnalyticsTab;
  isCustomRange: boolean;
  timeframe: AnalyticsPageTimeframe;
  dateRange: DateRangeState;
}
