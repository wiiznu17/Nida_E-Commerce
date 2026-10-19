// ====================================================
// @repo/types — Customer Auth & OTP Types (Storefront)
// ====================================================

import type { ApiUser } from './user.types.js';

export interface RequestOtpResponse {
  success: boolean;
  message: string;
  expiresInSeconds: number;
  devOtpCode?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: ApiUser;
  isNewUser: boolean;
}

export interface CustomerRefreshResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface CustomerSessionData {
  sessionId: string;
  userId: string;
  email: string;
  device?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  lastRotatedAt?: string;
}

export interface CustomerJwtPayload {
  sub: string;
  email: string;
  role: 'CUSTOMER';
  iat?: number;
  exp?: number;
}

