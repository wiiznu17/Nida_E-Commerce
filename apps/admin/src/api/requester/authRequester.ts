import { apiClient } from '../client';
import type {
  AdminLoginResponse,
  AdminRefreshResponse,
  ApiAdminUser,
  ApiAdminRole,
  InviteAdminDto,
  InviteAdminResponse,
  VerifyTokenResponse,
  SetupPasswordDto,
  ResetPasswordDto,
} from '@repo/types';

export const authRequester = {
  login: async (credentials: { identifier: string; password: string }): Promise<AdminLoginResponse> => {
    return apiClient.post<AdminLoginResponse>('/auth/admin/login', credentials);
  },

  refresh: async (refreshToken: string): Promise<AdminRefreshResponse> => {
    return apiClient.post<AdminRefreshResponse>('/auth/admin/refresh', { refreshToken });
  },

  getMe: async (): Promise<ApiAdminUser> => {
    return apiClient.get<ApiAdminUser>('/auth/admin/me');
  },

  logout: async (refreshToken?: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/admin/logout', { refreshToken });
  },

  logoutAll: async (): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/admin/logout-all');
  },

  verifyToken: async (token: string, type: 'invite' | 'reset'): Promise<VerifyTokenResponse> => {
    return apiClient.get<VerifyTokenResponse>('/auth/admin/verify-token', { token, type });
  },

  setupPassword: async (dto: SetupPasswordDto): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/admin/setup-password', dto);
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/admin/forgot-password', { email });
  },

  resetPassword: async (dto: ResetPasswordDto): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/admin/reset-password', dto);
  },

  // Admin users management
  getUsers: async (): Promise<ApiAdminUser[]> => {
    return apiClient.get<ApiAdminUser[]>('/admin/users');
  },

  getRoles: async (): Promise<ApiAdminRole[]> => {
    return apiClient.get<ApiAdminRole[]>('/admin/users/roles');
  },

  inviteUser: async (dto: InviteAdminDto): Promise<InviteAdminResponse> => {
    return apiClient.post<InviteAdminResponse>('/admin/users/invite', dto);
  },

  toggleUserStatus: async (userId: string): Promise<ApiAdminUser> => {
    return apiClient.patch<ApiAdminUser>(`/admin/users/${userId}/toggle`);
  },
};
