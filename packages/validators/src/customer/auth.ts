import { z } from 'zod';

/**
 * Customer Password Login Schema (Step 1)
 */
export const customerLoginSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export type CustomerLoginInput = z.infer<typeof customerLoginSchema>;

/**
 * Customer Registration Schema (Step 1)
 */
export const customerRegisterSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  phone: z.string().trim().min(1, 'Phone number is required'),
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;

/**
 * Customer 2-Step OTP Verification Schema (Step 2)
 */
export const customerVerifyOtpSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  otpCode: z
    .string()
    .trim()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must be numeric digits'),
});

export type CustomerVerifyOtpInput = z.infer<typeof customerVerifyOtpSchema>;

/**
 * Customer Resend OTP Schema
 */
export const customerResendOtpSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
});

export type CustomerResendOtpInput = z.infer<typeof customerResendOtpSchema>;

/**
 * Customer Forgot Password Schema
 */
export const customerForgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
});

export type CustomerForgotPasswordInput = z.infer<
  typeof customerForgotPasswordSchema
>;

/**
 * Customer Reset Password Schema
 */
export const customerResetPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address format').toLowerCase(),
  otpCode: z
    .string()
    .trim()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must be numeric digits'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export type CustomerResetPasswordInput = z.infer<
  typeof customerResetPasswordSchema
>;

/**
 * Customer Request OTP Schema (Legacy / Fallback)
 */
export const requestOtpSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  intent: z.enum(['signin', 'signup']).optional(),
  cfTurnstileToken: z.string().trim().optional(),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;

/**
 * Customer Verify OTP Schema (Legacy / Fallback)
 */
export const verifyOtpSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  otpCode: z
    .string()
    .trim()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must be numeric digits'),
  intent: z.enum(['signin', 'signup']).optional(),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

/**
 * Customer Email Existence Check Schema
 */
export const checkEmailSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
});

export type CheckEmailInput = z.infer<typeof checkEmailSchema>;

/**
 * Update Customer Profile Schema
 */
export const updateCustomerProfileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name cannot be empty').optional(),
  lastName: z.string().trim().min(1, 'Last name cannot be empty').optional(),
  phone: z.string().trim().optional(),
});

export type UpdateCustomerProfileInput = z.infer<
  typeof updateCustomerProfileSchema
>;

/**
 * Customer Refresh Token Schema
 */
export const customerRefreshTokenSchema = z.object({
  refreshToken: z.string().trim().min(1, 'Refresh token is required'),
});

export type CustomerRefreshTokenInput = z.infer<
  typeof customerRefreshTokenSchema
>;

/**
 * Customer Shipping / Billing Address Schema
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
