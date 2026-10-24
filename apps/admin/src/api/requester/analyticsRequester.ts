import { apiClient, API_BASE_URL } from '../client';
import type {
  AnalyticsBestSeller,
  AnalyticsCouponRoiSummary,
  AnalyticsDepartmentShare,
  AnalyticsExportPayload,
  AnalyticsInventoryVelocity,
  AnalyticsOverviewDto,
  AnalyticsPageTimeframe,
  AnalyticsRevenuePoint,
  AnalyticsSlowMovingProduct,
  AnalyticsTimeframe,
  AnalyticsTopProduct,
} from '@repo/types';

export interface AnalyticsFilterParams {
  timeframe?: AnalyticsPageTimeframe;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface SlowMovingParams {
  days?: number;
  limit?: number;
}

export interface ExportOrdersParams {
  startDate: string;
  endDate: string;
  status?: string;
}

export interface ExportProductsParams {
  department?: string;
  category?: string;
}

export interface ExportInventoryParams {
  status?: 'all' | 'low_stock' | 'out_of_stock';
}

export interface ExportAuditLogsParams {
  startDate: string;
  endDate: string;
  action?: string;
}

function buildQueryString(
  params: Record<string, string | number | boolean | undefined>,
): string {
  const sp = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== '') {
      sp.set(key, String(val));
    }
  }
  const str = sp.toString();
  return str ? `?${str}` : '';
}

async function fetchExportBlob(
  endpoint: string,
  params: Record<string, unknown>,
): Promise<Blob> {
  const query = buildQueryString(
    params as Record<string, string | number | boolean | undefined>,
  );
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('nida_auth_token')
      : null;

  const res = await fetch(`${API_BASE_URL}${endpoint}${query}`, {
    method: 'GET',
    headers: {
      Accept: 'text/csv; charset=utf-8',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Export failed with status ${res.status}`);
  }

  return res.blob();
}

export const analyticsRequester = {
  // ─── Overview ─────────────────────────────────────────────────────────────

  async getOverview(
    timeframeOrParams:
      | AnalyticsTimeframe
      | AnalyticsPageTimeframe
      | AnalyticsFilterParams,
  ): Promise<AnalyticsOverviewDto> {
    if (typeof timeframeOrParams === 'string') {
      return apiClient.get<AnalyticsOverviewDto>(
        `/analytics/overview?timeframe=${timeframeOrParams}`,
      );
    }
    const query = buildQueryString(
      timeframeOrParams as Record<string, string | number | undefined>,
    );
    return apiClient.get<AnalyticsOverviewDto>(`/analytics/overview${query}`);
  },

  // ─── Department Share / Sales ──────────────────────────────────────────────

  async getDepartmentShare(
    timeframeOrParams:
      | AnalyticsTimeframe
      | AnalyticsPageTimeframe
      | AnalyticsFilterParams,
  ): Promise<AnalyticsDepartmentShare[]> {
    if (typeof timeframeOrParams === 'string') {
      return apiClient.get<AnalyticsDepartmentShare[]>(
        `/analytics/sales-by-department?timeframe=${timeframeOrParams}`,
      );
    }
    const query = buildQueryString(
      timeframeOrParams as Record<string, string | number | undefined>,
    );
    return apiClient.get<AnalyticsDepartmentShare[]>(
      `/analytics/sales-by-department${query}`,
    );
  },

  // ─── Dashboard Trends ─────────────────────────────────────────────────────

  async getRevenueTrend(
    timeframe: AnalyticsTimeframe,
  ): Promise<AnalyticsRevenuePoint[]> {
    return apiClient.get<AnalyticsRevenuePoint[]>(
      `/analytics/revenue-trend?timeframe=${timeframe}`,
    );
  },

  async getBestSellers(
    timeframe: AnalyticsTimeframe,
  ): Promise<AnalyticsBestSeller[]> {
    return apiClient.get<AnalyticsBestSeller[]>(
      `/analytics/best-sellers?timeframe=${timeframe}`,
    );
  },

  async getInventoryVelocity(): Promise<AnalyticsInventoryVelocity[]> {
    return apiClient.get<AnalyticsInventoryVelocity[]>(
      '/analytics/inventory-velocity',
    );
  },

  // ─── Analytics Page Endpoints ──────────────────────────────────────────────

  async getTopProducts(
    params: AnalyticsFilterParams,
  ): Promise<AnalyticsTopProduct[]> {
    const query = buildQueryString(
      params as Record<string, string | number | undefined>,
    );
    return apiClient.get<AnalyticsTopProduct[]>(`/analytics/top-products${query}`);
  },

  async getSlowMovingProducts(
    params?: SlowMovingParams,
  ): Promise<AnalyticsSlowMovingProduct[]> {
    const query = buildQueryString(
      (params ?? {}) as Record<string, string | number | undefined>,
    );
    return apiClient.get<AnalyticsSlowMovingProduct[]>(
      `/analytics/slow-moving-products${query}`,
    );
  },

  async getCouponRoi(
    params: AnalyticsFilterParams,
  ): Promise<AnalyticsCouponRoiSummary> {
    const query = buildQueryString(
      params as Record<string, string | number | undefined>,
    );
    return apiClient.get<AnalyticsCouponRoiSummary>(`/analytics/coupon-roi${query}`);
  },

  // ─── Data Export Endpoints (CSV) ──────────────────────────────────────────

  async exportOrders(params: ExportOrdersParams): Promise<Blob> {
    return fetchExportBlob(
      '/analytics/export/orders',
      params as unknown as Record<string, unknown>,
    );
  },

  async exportProducts(params?: ExportProductsParams): Promise<Blob> {
    return fetchExportBlob(
      '/analytics/export/products',
      (params ?? {}) as unknown as Record<string, unknown>,
    );
  },

  async exportInventory(params?: ExportInventoryParams): Promise<Blob> {
    return fetchExportBlob(
      '/analytics/export/inventory',
      (params ?? {}) as unknown as Record<string, unknown>,
    );
  },

  async exportAuditLogs(params: ExportAuditLogsParams): Promise<Blob> {
    return fetchExportBlob(
      '/analytics/export/audit-logs',
      params as unknown as Record<string, unknown>,
    );
  },

  async triggerExport(payload: AnalyticsExportPayload): Promise<Blob> {
    const sp: Record<string, string | number | undefined> = {
      dataType: payload.dataType,
      timeframe: payload.timeframe,
      format: payload.format,
      startDate: payload.startDate,
      endDate: payload.endDate,
    };
    return fetchExportBlob('/analytics/export', sp);
  },
};
