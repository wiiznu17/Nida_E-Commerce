import type { AnalyticsPageTimeframe } from '@repo/types';
import type { DropdownSelectOption } from '../ui';
import type { AnalyticsTab } from './analyticsTypes';

export interface AnalyticsTabItem {
  id: AnalyticsTab;
  labelKey: string;
}

export const ANALYTICS_TABS: AnalyticsTabItem[] = [
  { id: 'overview', labelKey: 'analytics.tabs.overview' },
  { id: 'department', labelKey: 'analytics.tabs.department' },
  { id: 'products', labelKey: 'analytics.tabs.topProducts' },
  { id: 'slow-moving', labelKey: 'analytics.tabs.slowMoving' },
  { id: 'coupon', labelKey: 'analytics.tabs.couponRoi' },
  { id: 'export', labelKey: 'analytics.tabs.export' },
];

export const ANALYTICS_TIMEFRAME_OPTIONS: {
  value: AnalyticsPageTimeframe | 'custom';
  labelKey: string;
}[] = [
  { value: 'today', labelKey: 'analytics.timeframe.today' },
  { value: 'week', labelKey: 'analytics.timeframe.week' },
  { value: 'month', labelKey: 'analytics.timeframe.month' },
  { value: 'quarter', labelKey: 'analytics.timeframe.quarter' },
  { value: 'year', labelKey: 'analytics.timeframe.year' },
  { value: 'custom', labelKey: 'analytics.timeframe.custom' },
];

export const SLOW_MOVING_DAY_OPTIONS: DropdownSelectOption[] = [
  { value: '14', label: '14 Days' },
  { value: '30', label: '30 Days' },
  { value: '60', label: '60 Days' },
  { value: '90', label: '90 Days' },
  { value: '180', label: '180 Days' },
];
