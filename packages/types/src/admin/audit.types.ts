// ====================================================
// @repo/types — Admin Audit Log Types
// ====================================================

import type { AuditActionType } from '../common/enums.js';

export interface AuditAdminSummary {
  id: string;
  email: string;
  fullName: string;
  username: string;
  roleCode?: string;
  department?: string | null;
}

export interface ApiAuditLog {
  id: string;
  adminId: string | null;
  admin?: AuditAdminSummary | null;
  actionType: AuditActionType;
  targetTable: string;
  targetId: string;
  permission?: string | null;
  performedRole?: string | null;
  oldValuesJson?: Record<string, unknown> | null;
  newValuesJson?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface AuditLogFilterQuery {
  page?: number;
  limit?: number;
  targetTable?: string;
  actionType?: AuditActionType;
  permission?: string;
  adminId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogStats {
  totalLogs: number;
  todayLogs: number;
  topActionType?: AuditActionType | null;
  topTargetTable?: string | null;
}
