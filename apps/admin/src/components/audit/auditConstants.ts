import { AuditActionType } from '@repo/types';

export interface ActionBadgeConfig {
  labelKey: string;
  badgeClass: string;
  dotClass: string;
}

export const AUDIT_ACTION_CONFIG: Record<AuditActionType, ActionBadgeConfig> = {
  [AuditActionType.CREATE]: {
    labelKey: 'audit.actionCreate',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    dotClass: 'bg-emerald-500',
  },
  [AuditActionType.UPDATE]: {
    labelKey: 'audit.actionUpdate',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-200/80',
    dotClass: 'bg-amber-500',
  },
  [AuditActionType.DELETE]: {
    labelKey: 'audit.actionDelete',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200/80',
    dotClass: 'bg-rose-500',
  },
  [AuditActionType.STATUS_CHANGE]: {
    labelKey: 'audit.actionStatusChange',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200/80',
    dotClass: 'bg-blue-500',
  },
  [AuditActionType.REFUND]: {
    labelKey: 'audit.actionRefund',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200/80',
    dotClass: 'bg-purple-500',
  },
};

export const TARGET_TABLE_KEYS: Record<string, string> = {
  products: 'audit.tableProducts',
  orders: 'audit.tableOrders',
  inventory_items: 'audit.tableInventory',
  coupons: 'audit.tableCoupons',
  admin_users: 'audit.tableStaff',
  shipments: 'audit.tableShipments',
};
