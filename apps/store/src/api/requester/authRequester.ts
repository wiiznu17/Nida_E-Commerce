import { apiClient } from '../client';
import type {
  ApiUser,
  RequestOtpResponse,
  VerifyOtpResponse,
  CustomerRefreshResponse,
} from '@repo/types';
import type { UpdateCustomerProfileInput } from '@repo/validators';

export const authRequester = {
  /**
   * Request 6-digit OTP code sent to customer email.
   */
  requestOtp: async (email: string): Promise<RequestOtpResponse> => {
    return apiClient.post<RequestOtpResponse>('/auth/request-otp', { email });
  },

  /**
   * Verify OTP code and retrieve dual tokens with customer profile.
   */
  verifyOtp: async (
    email: string,
    otpCode: string,
  ): Promise<VerifyOtpResponse> => {
    return apiClient.post<VerifyOtpResponse>('/auth/verify-otp', {
      email,
      otpCode,
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
