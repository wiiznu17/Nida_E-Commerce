export type OrderHistoryStatusFilter =
  | 'ALL'
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type OrderHistorySortOption =
  'newest' | 'oldest' | 'amount_desc' | 'amount_asc';

export interface OrderHistoryMetrics {
  totalOrders: number;
  pendingCount: number;
  processingCount: number;
  inTransitCount: number;
  deliveredCount: number;
  completedCount: number;
  totalSpent: number;
}
