import { z } from 'zod';

/**
 * Admin Login Credentials Schema
 */
export const adminLoginSchema = z.object({
  identifier: z.string().trim().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

/**
 * Admin Refresh Token Schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().trim().min(1, 'Refresh token is required'),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

/**
 * Admin Setup Password Schema (First-time invitation)
 */
export const setupPasswordSchema = z.object({
  token: z.string().trim().min(1, 'Invitation token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export type SetupPasswordInput = z.infer<typeof setupPasswordSchema>;

/**
 * Admin Forgot Password Schema
 */
export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Admin Reset Password Schema
 */
export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, 'Password reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Invite New Admin Staff Schema
 */
export const inviteAdminSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required'),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  roleId: z.string().uuid('Invalid role ID format'),
  department: z.string().trim().optional(),
});

export type InviteAdminInput = z.infer<typeof inviteAdminSchema>;
