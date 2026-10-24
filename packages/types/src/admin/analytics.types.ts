// ─── Dashboard Timeframe (ใช้ใน AdminDashboard.tsx — ห้ามแก้ไข) ─────────────
export type AnalyticsTimeframe = 'today' | '7d' | '30d' | 'year';

// ─── Analytics Page Timeframe (ใช้ใน AdminAnalytics.tsx เท่านั้น) ─────────────
export type AnalyticsPageTimeframe =
  | 'today'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year';

/**
 * Discriminated union สำหรับ analytics query mode:
 * - Preset timeframe → Redis cache
 * - Custom date range → Direct DB query (no cache)
 */
export type AnalyticsQueryMode =
  | {
      timeframe: AnalyticsPageTimeframe;
      startDate?: never;
      endDate?: never;
    }
  | {
      timeframe?: never;
      startDate: string;
      endDate: string;
    };

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

// ─── Analytics Page — Response Types ─────────────────────────────────────────

/** สินค้าขายดี (Top Products) */
export interface AnalyticsTopProduct {
  rank: number;
  productId: string;
  productName: string;
  skuCode: string;
  thumbnailUrl?: string | null;
  unitsSold: number;
  revenue: number;
  stockAvailable: number;
}

/** สินค้าค้างสต็อก (Slow Moving Products) */
export interface AnalyticsSlowMovingProduct {
  productId: string;
  productName: string;
  skuCode: string;
  department: string;
  currentStock: number;
  daysSinceLastSale: number;
  lastSoldAt: string | null;
}

/** ROI ต่อคูปองแต่ละใบ */
export interface AnalyticsCouponRoiItem {
  couponId: string;
  couponCode: string;
  couponName: string;
  usageCount: number;
  totalDiscount: number;
  netRevenue: number;
  roiPercent: number;
}

/** สรุป ROI คูปองรวม */
export interface AnalyticsCouponRoiSummary {
  totalUsage: number;
  totalDiscount: number;
  netRevenueGenerated: number;
  avgRoiPercent: number;
  items: AnalyticsCouponRoiItem[];
}

// ─── Analytics Cache TTL Map (seconds) ───────────────────────────────────────
export const ANALYTICS_CACHE_TTL: Record<AnalyticsPageTimeframe, number> = {
  today: 300,
  week: 600,
  month: 900,
  quarter: 3600,
  year: 7200,
};
