export type AnalyticsTimeframe = 'today' | '7d' | '30d' | 'year';

export interface AnalyticsOverviewDto {
  netRevenue: number;
  grossRevenue: number;
  totalDiscounts: number;
  totalRefunds: number;
  revenueTrendPct: number;
  totalOrders: number;
  completedOrders: number;
  ordersTrendPct: number;
  fulfillmentRate: number; // e.g. 98.4
  averageFulfillmentHours: number; // e.g. 3.8
  aov: number; // Average Order Value
  aovTrendPct: number;
  returningCustomerPct: number;
  newCustomerPct: number;
  conversionRate: number;
  cartAbandonmentRate: number;
  returnRate: number;
  pendingShipmentCount: number;
  lowStockCount: number;
  activeShoppersCount: number;
}

export interface AnalyticsRevenuePoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface AnalyticsDepartmentShare {
  department: string;
  labelEn: string;
  labelTh: string;
  revenue: number;
  percentage: number;
  unitsSold: number;
  color: string;
}

export type InventoryUrgency = 'CRITICAL' | 'WARNING' | 'NORMAL';

export interface AnalyticsBestSeller {
  productId: string;
  productName: string;
  skuCode: string;
  thumbnailUrl?: string | null;
  unitsSold: number;
  revenue: number;
  stockAvailable: number;
  stockStatus: 'HEALTHY' | 'LOW' | 'OUT_OF_STOCK';
}

export interface AnalyticsInventoryVelocity {
  productId: string;
  productName: string;
  skuCode: string;
  dailyVelocity: number;
  daysRemaining: number;
  currentStock: number;
  suggestedRestock: number;
  urgency: InventoryUrgency;
}

export type ExportDataType = 'orders' | 'inventory' | 'revenue' | 'customers';
export type ExportFileFormat = 'csv' | 'json';

export interface AnalyticsExportPayload {
  dataType: ExportDataType;
  timeframe: AnalyticsTimeframe;
  format: ExportFileFormat;
  startDate?: string;
  endDate?: string;
}
