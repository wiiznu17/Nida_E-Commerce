// @repo/types — Admin Store Customer Management Types

import type { MembershipTier, AccountStatus } from '../common/enums.js';
import type { ApiAddress } from '../customer/user.types.js';

export interface ApiAdminCustomerListItem {
  id: string;
  email: string;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName: string;
  tier: MembershipTier;
  points: number;
  status: AccountStatus;
  statusReason?: string | null;
  suspendedAt?: string | null;
  suspendedUntil?: string | null;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
}

export interface ApiAdminCustomerRecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
}

export interface ApiAdminCustomerDetail extends ApiAdminCustomerListItem {
  addresses: ApiAddress[];
  recentOrders: ApiAdminCustomerRecentOrder[];
}

export interface AdminCustomerQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: AccountStatus;
  tier?: MembershipTier;
  sortBy?: 'createdAt' | 'fullName' | 'totalSpent' | 'ordersCount' | 'points';
  sortOrder?: 'asc' | 'desc';
}

export interface ApiAdminCustomerStats {
  total: number;
  active: number;
  suspended: number;
  banned: number;
  vipCount: number;
}

