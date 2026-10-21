// @repo/types — Customer Profile & Address Types

import type { MembershipTier } from '../common/enums.js';

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
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressDto {
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface UpdateAddressDto {
  recipientName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  isDefault?: boolean;
}
