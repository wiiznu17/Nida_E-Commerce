// ====================================================
// RBAC & PERMISSION CONSTANTS & TYPES
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
}

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

// ====================================================
// AUTH REQUEST & RESPONSE PAYLOADS
// ====================================================

export interface AdminLoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number; // วินาที เช่น 900 (15 นาที)
  admin: ApiAdminUser;
}

export interface AdminRefreshResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface AdminJwtPayload {
  sub: string; // AdminUser UUID
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

// ====================================================
// INVITATION & PASSWORD LIFECYCLE DTO & RESPONSES
// ====================================================

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

export interface VerifyTokenQueryDto {
  token: string;
  type: 'invite' | 'reset';
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

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}
