import { apiClient } from '../client';
import type {
  ApiUser,
  RequestOtpResponse,
  VerifyOtpResponse,
} from '@repo/types';

export const authRequester = {
  /**
   * Request 6-digit OTP code sent to customer email.
   */
  requestOtp: async (email: string): Promise<RequestOtpResponse> => {
    return apiClient.post<RequestOtpResponse>('/auth/request-otp', { email });
  },

  /**
   * Verify OTP code and retrieve access token with customer profile.
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
   * Get current customer profile using JWT token.
   */
  getProfile: async (token?: string | null): Promise<ApiUser> => {
    return apiClient.get<ApiUser>('/auth/me', undefined, token);
  },
};
