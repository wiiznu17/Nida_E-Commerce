// ====================================================
// @repo/types — Customer Auth & OTP Types (Storefront)
// ====================================================

import type { ApiUser } from './user.types.js';

export interface RequestOtpResponse {
  success: boolean;
  message: string;
  expiresInSeconds: number;
}

export interface VerifyOtpResponse {
  success: boolean;
  accessToken: string;
  user: ApiUser;
  isNewUser: boolean;
}

export interface CustomerJwtPayload {
  sub: string;
  email: string;
  role: 'CUSTOMER';
  iat?: number;
  exp?: number;
}
