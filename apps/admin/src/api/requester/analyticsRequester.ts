import { apiClient } from '../client';
import type {
  AnalyticsOverviewDto,
  AnalyticsRevenuePoint,
  AnalyticsDepartmentShare,
  AnalyticsBestSeller,
  AnalyticsInventoryVelocity,
  AnalyticsTimeframe,
  AnalyticsExportPayload,
} from '@repo/types';

export const analyticsRequester = {
  async getOverview(timeframe: AnalyticsTimeframe): Promise<AnalyticsOverviewDto> {
    return apiClient.get<AnalyticsOverviewDto>(`/analytics/overview?timeframe=${timeframe}`);
  },

  async getRevenueTrend(timeframe: AnalyticsTimeframe): Promise<AnalyticsRevenuePoint[]> {
    return apiClient.get<AnalyticsRevenuePoint[]>(`/analytics/revenue-trend?timeframe=${timeframe}`);
  },

  async getDepartmentShare(timeframe: AnalyticsTimeframe): Promise<AnalyticsDepartmentShare[]> {
    return apiClient.get<AnalyticsDepartmentShare[]>(`/analytics/department-share?timeframe=${timeframe}`);
  },

  async getBestSellers(timeframe: AnalyticsTimeframe): Promise<AnalyticsBestSeller[]> {
    return apiClient.get<AnalyticsBestSeller[]>(`/analytics/best-sellers?timeframe=${timeframe}`);
  },

  async getInventoryVelocity(): Promise<AnalyticsInventoryVelocity[]> {
    return apiClient.get<AnalyticsInventoryVelocity[]>('/analytics/inventory-velocity');
  },

  async triggerExport(payload: AnalyticsExportPayload): Promise<Blob> {
    const sp = new URLSearchParams();
    sp.set('dataType', payload.dataType);
    sp.set('timeframe', payload.timeframe);
    sp.set('format', payload.format);
    if (payload.startDate) sp.set('startDate', payload.startDate);
    if (payload.endDate) sp.set('endDate', payload.endDate);

    const res = await fetch(`/api/v1/analytics/export?${sp.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': payload.format === 'csv' ? 'text/csv' : 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Export failed with status ${res.status}`);
    }

    return res.blob();
  },
};
