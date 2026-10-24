import { z } from 'zod';

/**
 * Analytics Page Timeframe enum
 * (แยกจาก AnalyticsTimeframe ที่ dashboard ใช้)
 */
const analyticsPageTimeframeEnum = z.enum([
  'today',
  'week',
  'month',
  'quarter',
  'year',
]);

/**
 * ISO date string validator (YYYY-MM-DD)
 */
const isoDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'Date must be in YYYY-MM-DD format',
});

/**
 * Mutual-exclusive union: preset timeframe OR custom date range.
 * Preset → Redis cache, Custom range → Direct DB query.
 */
const timeframeOrRange = z.union([
  z.object({
    timeframe: analyticsPageTimeframeEnum,
  }),
  z
    .object({
      startDate: isoDateString,
      endDate: isoDateString,
    })
    .refine((d) => d.startDate <= d.endDate, {
      message: 'startDate must be on or before endDate',
      path: ['startDate'],
    }),
]);

// ─── Analytics Dashboard Query Schemas ───────────────────────────────────────

/**
 * GET /admin/analytics/overview
 */
export const analyticsOverviewSchema = timeframeOrRange;
export type AnalyticsOverviewQuery = z.infer<typeof analyticsOverviewSchema>;

/**
 * GET /admin/analytics/sales-by-department
 */
export const analyticsDeptSchema = timeframeOrRange;
export type AnalyticsDeptQuery = z.infer<typeof analyticsDeptSchema>;

/**
 * GET /admin/analytics/top-products
 */
export const analyticsTopProductsSchema = z.union([
  z.object({
    timeframe: analyticsPageTimeframeEnum,
    limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  }),
  z
    .object({
      startDate: isoDateString,
      endDate: isoDateString,
      limit: z.coerce.number().int().min(1).max(50).optional().default(10),
    })
    .refine((d) => d.startDate <= d.endDate, {
      message: 'startDate must be on or before endDate',
      path: ['startDate'],
    }),
]);
export type AnalyticsTopProductsQuery = z.infer<
  typeof analyticsTopProductsSchema
>;

/**
 * GET /admin/analytics/coupon-roi
 */
export const analyticsCouponRoiSchema = timeframeOrRange;
export type AnalyticsCouponRoiQuery = z.infer<typeof analyticsCouponRoiSchema>;

/**
 * GET /admin/analytics/slow-moving-products
 * (ใช้ days เท่านั้น — ไม่รองรับ custom date range)
 */
export const analyticsSlowMovingSchema = z.object({
  days: z.coerce.number().int().min(7).max(365).optional().default(30),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});
export type AnalyticsSlowMovingQuery = z.infer<typeof analyticsSlowMovingSchema>;

// ─── Export CSV Query Schemas ─────────────────────────────────────────────────

/**
 * GET /admin/analytics/export/orders
 */
export const exportOrdersSchema = z
  .object({
    startDate: isoDateString,
    endDate: isoDateString,
    status: z.string().trim().optional(),
  })
  .refine((d) => d.startDate <= d.endDate, {
    message: 'startDate must be on or before endDate',
    path: ['startDate'],
  });
export type ExportOrdersQuery = z.infer<typeof exportOrdersSchema>;

/**
 * GET /admin/analytics/export/products
 */
export const exportProductsSchema = z.object({
  department: z.string().trim().optional(),
  category: z.string().trim().optional(),
});
export type ExportProductsQuery = z.infer<typeof exportProductsSchema>;

/**
 * GET /admin/analytics/export/inventory
 */
export const exportInventorySchema = z.object({
  status: z
    .enum(['all', 'low_stock', 'out_of_stock'])
    .optional()
    .default('all'),
});
export type ExportInventoryQuery = z.infer<typeof exportInventorySchema>;

/**
 * GET /admin/analytics/export/audit-logs
 */
export const exportAuditLogsSchema = z
  .object({
    startDate: isoDateString,
    endDate: isoDateString,
    action: z.string().trim().optional(),
  })
  .refine((d) => d.startDate <= d.endDate, {
    message: 'startDate must be on or before endDate',
    path: ['startDate'],
  });
export type ExportAuditLogsQuery = z.infer<typeof exportAuditLogsSchema>;
