// ====================================================
// @repo/types — Admin Auth & RBAC Types
// ====================================================

export enum AdminRoleCode {
  SUPER_ADMIN = 'SUPER_ADMIN',
  INVENTORY_MANAGER = 'INVENTORY_MANAGER',
  ORDER_MANAGER = 'ORDER_MANAGER',
  MARKETING_ADMIN = 'MARKETING_ADMIN',
}

export enum AdminPermission {
  CATALOG_READ = 'CATALOG_READ',
  CATALOG_WRITE = 'CATALOG_WRITE',
  INVENTORY_READ = 'INVENTORY_READ',
  INVENTORY_ADJUST = 'INVENTORY_ADJUST',
  ORDERS_READ = 'ORDERS_READ',
  ORDERS_FULFILL = 'ORDERS_FULFILL',
  COUPONS_READ = 'COUPONS_READ',
  COUPONS_MANAGE = 'COUPONS_MANAGE',
  ADMIN_USERS_MANAGE = 'ADMIN_USERS_MANAGE',
  AUDIT_LOGS_READ = 'AUDIT_LOGS_READ',
}

export const ROLE_DEFAULT_PERMISSIONS: Record<
  AdminRoleCode,
  AdminPermission[]
> = {
  [AdminRoleCode.SUPER_ADMIN]: [
    AdminPermission.CATALOG_READ,
    AdminPermission.CATALOG_WRITE,
    AdminPermission.INVENTORY_READ,
    AdminPermission.INVENTORY_ADJUST,
    AdminPermission.ORDERS_READ,
    AdminPermission.ORDERS_FULFILL,
    AdminPermission.COUPONS_READ,
    AdminPermission.COUPONS_MANAGE,
    AdminPermission.ADMIN_USERS_MANAGE,
    AdminPermission.AUDIT_LOGS_READ,
  ],
  [AdminRoleCode.INVENTORY_MANAGER]: [
    AdminPermission.CATALOG_READ,
    AdminPermission.INVENTORY_READ,
    AdminPermission.INVENTORY_ADJUST,
    AdminPermission.ORDERS_READ,
  ],
  [AdminRoleCode.ORDER_MANAGER]: [
    AdminPermission.CATALOG_READ,
    AdminPermission.INVENTORY_READ,
    AdminPermission.ORDERS_READ,
    AdminPermission.ORDERS_FULFILL,
  ],
  [AdminRoleCode.MARKETING_ADMIN]: [
    AdminPermission.CATALOG_READ,
    AdminPermission.ORDERS_READ,
    AdminPermission.COUPONS_READ,
    AdminPermission.COUPONS_MANAGE,
  ],
};

export interface PermissionDefinition {
  code: AdminPermission;
  module: string;
  nameKey: string;
  descriptionKey: string;
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  {
    code: AdminPermission.CATALOG_READ,
    module: 'CATALOG',
    nameKey: 'permissions.catalogReadName',
    descriptionKey: 'permissions.catalogReadDesc',
  },
  {
    code: AdminPermission.CATALOG_WRITE,
    module: 'CATALOG',
    nameKey: 'permissions.catalogWriteName',
    descriptionKey: 'permissions.catalogWriteDesc',
  },
  {
    code: AdminPermission.INVENTORY_READ,
    module: 'INVENTORY',
    nameKey: 'permissions.inventoryReadName',
    descriptionKey: 'permissions.inventoryReadDesc',
  },
  {
    code: AdminPermission.INVENTORY_ADJUST,
    module: 'INVENTORY',
    nameKey: 'permissions.inventoryAdjustName',
    descriptionKey: 'permissions.inventoryAdjustDesc',
  },
  {
    code: AdminPermission.ORDERS_READ,
    module: 'ORDERS',
    nameKey: 'permissions.ordersReadName',
    descriptionKey: 'permissions.ordersReadDesc',
  },
  {
    code: AdminPermission.ORDERS_FULFILL,
    module: 'ORDERS',
    nameKey: 'permissions.ordersFulfillName',
    descriptionKey: 'permissions.ordersFulfillDesc',
  },
  {
    code: AdminPermission.COUPONS_READ,
    module: 'PROMOTIONS',
    nameKey: 'permissions.couponsReadName',
    descriptionKey: 'permissions.couponsReadDesc',
  },
  {
    code: AdminPermission.COUPONS_MANAGE,
    module: 'PROMOTIONS',
    nameKey: 'permissions.couponsManageName',
    descriptionKey: 'permissions.couponsManageDesc',
  },
  {
    code: AdminPermission.ADMIN_USERS_MANAGE,
    module: 'STAFF',
    nameKey: 'permissions.adminUsersManageName',
    descriptionKey: 'permissions.adminUsersManageDesc',
  },
  {
    code: AdminPermission.AUDIT_LOGS_READ,
    module: 'SECURITY',
    nameKey: 'permissions.auditLogsReadName',
    descriptionKey: 'permissions.auditLogsReadDesc',
  },
];

export interface ApiAdminRole {
  id: string;
  roleCode: string;
  roleName: string;
  description?: string | null;
  permissions: string[];
}

export interface ApiAdminUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  department?: string | null;
  role: ApiAdminRole;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  admin: ApiAdminUser;
}

export interface AdminRefreshResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface AdminJwtPayload {
  sub: string;
  username: string;
  email: string;
  roleCode: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}

export interface RedisSessionData {
  sessionId: string;
  adminId: string;
  username: string;
  fullName: string;
  roleCode: string;
  permissions?: string[];
  device?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  lastRotatedAt?: string;
}

export interface InviteAdminDto {
  fullName: string;
  email: string;
  roleId: string;
  department?: string;
}

export interface InviteAdminResponse {
  adminUser: ApiAdminUser;
  inviteToken?: string;
  inviteLink?: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
  email?: string;
  fullName?: string;
}

export interface SetupPasswordDto {
  token: string;
  password: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}
