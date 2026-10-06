// ====================================================
// @repo/types — User Types (ผู้ใช้ & ที่อยู่)
// ====================================================

import type { MembershipTier } from './enums.js';

export interface ApiUser {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  tier: MembershipTier;
  points: number;
  isVerified: boolean;
  createdAt: string;
}

export interface ApiAddress {
  id: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}
