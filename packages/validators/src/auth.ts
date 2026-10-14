import { z } from 'zod';

/**
 * Customer Request OTP Schema
 */
export const requestOtpSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;

/**
 * Customer Verify OTP Schema
 */
export const verifyOtpSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  otpCode: z
    .string()
    .trim()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must be numeric digits'),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

/**
 * Update Customer Profile Schema
 */
export const updateCustomerProfileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name cannot be empty').optional(),
  lastName: z.string().trim().min(1, 'Last name cannot be empty').optional(),
  phone: z.string().trim().optional(),
});

export type UpdateCustomerProfileInput = z.infer<typeof updateCustomerProfileSchema>;

/**
 * Customer Address Schema
 */
export const customerAddressSchema = z.object({
  recipientName: z.string().trim().min(1, 'Recipient name is required'),
  phone: z.string().trim().min(1, 'Phone number is required'),
  addressLine1: z.string().trim().min(1, 'Address line 1 is required'),
  addressLine2: z.string().trim().optional().nullable(),
  subdistrict: z.string().trim().min(1, 'Subdistrict is required'),
  district: z.string().trim().min(1, 'District is required'),
  province: z.string().trim().min(1, 'Province is required'),
  postalCode: z.string().trim().min(1, 'Postal code is required'),
  isDefault: z.boolean().optional().default(false),
});

export type CustomerAddressInput = z.infer<typeof customerAddressSchema>;
