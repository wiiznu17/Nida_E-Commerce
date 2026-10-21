import type {
  AnalyticsTimeframe,
  AnalyticsRevenuePoint,
  AnalyticsDepartmentShare,
  AnalyticsBestSeller,
  AnalyticsInventoryVelocity,
  AnalyticsOverviewDto,
} from '@repo/types';

export const TIMEFRAME_OPTIONS: { id: AnalyticsTimeframe; labelKey: string }[] = [
  { id: 'today', labelKey: 'dashboard.timeframe.today' },
  { id: '7d', labelKey: 'dashboard.timeframe.week' },
  { id: '30d', labelKey: 'dashboard.timeframe.month' },
  { id: 'year', labelKey: 'dashboard.timeframe.year' },
];

export const DEFAULT_OVERVIEW_METRICS: AnalyticsOverviewDto = {
  netRevenue: 1428520,
  grossRevenue: 1580000,
  totalDiscounts: 132480,
  totalRefunds: 19000,
  revenueTrendPct: 18.4,
  totalOrders: 342,
  completedOrders: 322,
  ordersTrendPct: 12.8,
  fulfillmentRate: 98.4,
  averageFulfillmentHours: 3.8,
  aov: 4176,
  aovTrendPct: 5.2,
  returningCustomerPct: 68,
  newCustomerPct: 32,
  conversionRate: 3.42,
  cartAbandonmentRate: 18.2,
  returnRate: 1.2,
  pendingShipmentCount: 14,
  lowStockCount: 5,
  activeShoppersCount: 24,
};

export const DEFAULT_REVENUE_POINTS_7D: AnalyticsRevenuePoint[] = [
  { date: '2026-10-15', label: '15 Oct', revenue: 168400, orders: 42 },
  { date: '2026-10-16', label: '16 Oct', revenue: 194200, orders: 48 },
  { date: '2026-10-17', label: '17 Oct', revenue: 215000, orders: 53 },
  { date: '2026-10-18', label: '18 Oct', revenue: 188300, orders: 45 },
  { date: '2026-10-19', label: '19 Oct', revenue: 242000, orders: 59 },
  { date: '2026-10-20', label: '20 Oct', revenue: 209100, orders: 50 },
  { date: '2026-10-21', label: '21 Oct', revenue: 211520, orders: 45 },
];

export const DEFAULT_DEPARTMENT_SHARES: AnalyticsDepartmentShare[] = [
  {
    department: 'WOMEN',
    labelEn: 'Women Collection',
    labelTh: 'คอลเลกชันสตรี',
    revenue: 628540,
    percentage: 44,
    unitsSold: 210,
    color: '#2B1810', // Deep Espresso
  },
  {
    department: 'MEN',
    labelEn: 'Men Collection',
    labelTh: 'คอลเลกชันบุรุษ',
    revenue: 399980,
    percentage: 28,
    unitsSold: 134,
    color: '#D97706', // Amber Gold
  },
  {
    department: 'BAGS',
    labelEn: 'Bags & Leather',
    labelTh: 'กระเป๋าและเครื่องหนัง',
    revenue: 228560,
    percentage: 16,
    unitsSold: 42,
    color: '#B45309', // Dark Amber
  },
  {
    department: 'SHOES',
    labelEn: 'Footwear & Heels',
    labelTh: 'รองเท้าและส้นสูง',
    revenue: 114280,
    percentage: 8,
    unitsSold: 28,
    color: '#78716C', // Stone Gray
  },
  {
    department: 'HOME',
    labelEn: 'Home & Living',
    labelTh: 'ของตกแต่งบ้าน',
    revenue: 57160,
    percentage: 4,
    unitsSold: 16,
    color: '#A8A29E', // Light Stone
  },
];

export const DEFAULT_BEST_SELLERS: AnalyticsBestSeller[] = [
  {
    productId: 'prod-001',
    productName: 'Silk Chiffon Evening Gown',
    skuCode: 'NIDA-DRS-001-M-BLK',
    unitsSold: 84,
    revenue: 360360,
    stockAvailable: 28,
    stockStatus: 'HEALTHY',
  },
  {
    productId: 'prod-002',
    productName: 'Cashmere Blend Tailored Blazer',
    skuCode: 'NIDA-BLZ-002-L-BRN',
    unitsSold: 62,
    revenue: 278380,
    stockAvailable: 12,
    stockStatus: 'HEALTHY',
  },
  {
    productId: 'prod-003',
    productName: 'Italian Calfskin Signature Tote',
    skuCode: 'NIDA-BAG-003-OS-CAM',
    unitsSold: 45,
    revenue: 265500,
    stockAvailable: 4,
    stockStatus: 'LOW',
  },
  {
    productId: 'prod-004',
    productName: 'Pleated Linen Wide-Leg Trousers',
    skuCode: 'NIDA-TRS-004-S-WHT',
    unitsSold: 39,
    revenue: 108810,
    stockAvailable: 19,
    stockStatus: 'HEALTHY',
  },
  {
    productId: 'prod-005',
    productName: 'Pointed Slingback Leather Pumps',
    skuCode: 'NIDA-SHS-005-38-BLK',
    unitsSold: 28,
    revenue: 97720,
    stockAvailable: 0,
    stockStatus: 'OUT_OF_STOCK',
  },
];

export const DEFAULT_INVENTORY_VELOCITY: AnalyticsInventoryVelocity[] = [
  {
    productId: 'prod-003',
    productName: 'Italian Calfskin Signature Tote',
    skuCode: 'NIDA-BAG-003-OS-CAM',
    dailyVelocity: 2.8,
    daysRemaining: 1.4,
    currentStock: 4,
    suggestedRestock: 25,
    urgency: 'CRITICAL',
  },
  {
    productId: 'prod-006',
    productName: 'Fine Merino Wool Knit Sweater',
    skuCode: 'NIDA-KNT-006-M-GRY',
    dailyVelocity: 1.9,
    daysRemaining: 3.1,
    currentStock: 6,
    suggestedRestock: 20,
    urgency: 'WARNING',
  },
  {
    productId: 'prod-002',
    productName: 'Cashmere Blend Tailored Blazer',
    skuCode: 'NIDA-BLZ-002-L-BRN',
    dailyVelocity: 2.1,
    daysRemaining: 5.7,
    currentStock: 12,
    suggestedRestock: 30,
    urgency: 'WARNING',
  },
  {
    productId: 'prod-001',
    productName: 'Silk Chiffon Evening Gown',
    skuCode: 'NIDA-DRS-001-M-BLK',
    dailyVelocity: 2.4,
    daysRemaining: 11.6,
    currentStock: 28,
    suggestedRestock: 15,
    urgency: 'NORMAL',
  },
];
