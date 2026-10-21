import type {
  AnalyticsTimeframe,
  AnalyticsRevenuePoint,
  AnalyticsDepartmentShare,
  ExportDataType,
  ExportFileFormat,
} from '@repo/types';

export interface DashboardMetricFilter {
  timeframe: AnalyticsTimeframe;
  setTimeframe: (tf: AnalyticsTimeframe) => void;
}

export interface DashboardHealthData {
  isStoreOnline: boolean;
  pendingShipmentCount: number;
  lowStockCount: number;
  conversionRate: number;
  activeShoppersCount: number;
}

export interface DashboardExportFormState {
  isOpen: boolean;
  dataType: ExportDataType;
  timeframe: AnalyticsTimeframe;
  format: ExportFileFormat;
  isDownloading: boolean;
  errorMessage: string | null;
}

export interface DashboardChartsData {
  timeframe: AnalyticsTimeframe;
  onTimeframeChange: (tf: AnalyticsTimeframe) => void;
  revenuePoints: AnalyticsRevenuePoint[];
  departmentShares: AnalyticsDepartmentShare[];
  fulfillmentScore: number;
  avgHours: number;
  onTimeDispatchPct: number;
}
