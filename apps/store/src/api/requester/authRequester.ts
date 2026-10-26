import { apiClient } from '../client';
import type {
  ApiUser,
  RequestOtpResponse,
  CustomerOtpChallengeResponse,
  VerifyOtpResponse,
  CustomerRefreshResponse,
} from '@repo/types';
import type {
  CustomerLoginInput,
  CustomerRegisterInput,
  CustomerVerifyOtpInput,
  CustomerResendOtpInput,
  CustomerForgotPasswordInput,
  CustomerResetPasswordInput,
  UpdateCustomerProfileInput,
} from '@repo/validators';

export const authRequester = {
  /**
   * Check if a customer email already exists in the system.
   */
  checkEmail: async (email: string): Promise<{ exists: boolean }> => {
    return apiClient.get<{ exists: boolean }>('/auth/check-email', { email });
  },

  /**
   * Step 1: Customer sign in with email and password -> returns OTP challenge.
   */
  login: async (
    data: CustomerLoginInput,
  ): Promise<CustomerOtpChallengeResponse> => {
    return apiClient.post<CustomerOtpChallengeResponse>('/auth/login', data);
  },

  /**
   * Step 2: Verify login OTP -> returns dual tokens and user profile.
   */
  verifyLoginOtp: async (
    data: CustomerVerifyOtpInput,
  ): Promise<VerifyOtpResponse> => {
    return apiClient.post<VerifyOtpResponse>('/auth/login/verify-otp', data);
  },

  /**
   * Step 1: Customer registration with details & password -> returns OTP challenge.
   */
  register: async (
    data: CustomerRegisterInput,
  ): Promise<CustomerOtpChallengeResponse> => {
    return apiClient.post<CustomerOtpChallengeResponse>('/auth/register', data);
  },

  /**
   * Step 2: Verify register OTP -> creates user and returns dual tokens.
   */
  verifyRegisterOtp: async (
    data: CustomerVerifyOtpInput,
  ): Promise<VerifyOtpResponse> => {
    return apiClient.post<VerifyOtpResponse>('/auth/register/verify-otp', data);
  },

  /**
   * Resend OTP code for any pending flow (login, register, forgot-password).
   */
  resendOtp: async (
    data: CustomerResendOtpInput,
  ): Promise<CustomerOtpChallengeResponse> => {
    return apiClient.post<CustomerOtpChallengeResponse>('/auth/resend-otp', data);
  },

  /**
   * Forgot password: Sends OTP verification to reset password.
   */
  forgotPassword: async (
    data: CustomerForgotPasswordInput,
  ): Promise<CustomerOtpChallengeResponse> => {
    return apiClient.post<CustomerOtpChallengeResponse>(
      '/auth/forgot-password',
      data,
    );
  },

  /**
   * Reset password: Submit OTP and new password.
   */
  resetPassword: async (
    data: CustomerResetPasswordInput,
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.post<{ success: boolean; message: string }>(
      '/auth/reset-password',
      data,
    );
  },

  /**
   * Request 6-digit OTP code sent to customer email with optional intent guard (legacy).
   */
  requestOtp: async (
    email: string,
    intent?: 'signin' | 'signup',
  ): Promise<RequestOtpResponse> => {
    return apiClient.post<RequestOtpResponse>('/auth/request-otp', {
      email,
      intent,
    });
  },

  /**
   * Verify OTP code and retrieve dual tokens with customer profile (legacy).
   */
  verifyOtp: async (
    email: string,
    otpCode: string,
    intent?: 'signin' | 'signup',
  ): Promise<VerifyOtpResponse> => {
    return apiClient.post<VerifyOtpResponse>('/auth/verify-otp', {
      email,
      otpCode,
      intent,
    });
  },

  /**
   * Rotate customer refresh token and retrieve a freshly minted access token.
   */
  refreshToken: async (
    refreshToken: string,
  ): Promise<CustomerRefreshResponse> => {
    return apiClient.post<CustomerRefreshResponse>('/auth/refresh', {
      refreshToken,
    });
  },

  /**
   * Terminate active customer session.
   */
  logout: async (
    refreshToken?: string | null,
  ): Promise<{ success: boolean }> => {
    return apiClient.post<{ success: boolean }>('/auth/logout', {
      refreshToken: refreshToken ?? undefined,
    });
  },

  /**
   * Invalidate and revoke all active sessions across all devices for this customer.
   */
  logoutAll: async (token?: string | null): Promise<{ success: boolean }> => {
    return apiClient.post<{ success: boolean }>(
      '/auth/logout-all',
      undefined,
      token,
    );
  },

  /**
   * Get current customer profile using JWT token.
   */
  getProfile: async (token?: string | null): Promise<ApiUser> => {
    return apiClient.get<ApiUser>('/auth/me', undefined, token);
  },

  /**
   * Persist customer personal profile updates to the database.
   */
  updateProfile: async (
    token: string,
    data: UpdateCustomerProfileInput,
  ): Promise<ApiUser> => {
    return apiClient.patch<ApiUser>('/auth/profile', data, token);
  },

  /**
   * Request an OTP to change primary account email address.
   */
  requestEmailChange: async (
    token: string,
    newEmail: string,
  ): Promise<RequestOtpResponse> => {
    return apiClient.post<RequestOtpResponse>(
      '/auth/request-email-change',
      { newEmail },
      token,
    );
  },

  /**
   * Verify OTP and finalize switching to the new email address.
   */
  verifyEmailChange: async (
    token: string,
    newEmail: string,
    otpCode: string,
  ): Promise<VerifyOtpResponse> => {
    return apiClient.post<VerifyOtpResponse>(
      '/auth/verify-email-change',
      { newEmail, otpCode },
      token,
    );
  },
};
