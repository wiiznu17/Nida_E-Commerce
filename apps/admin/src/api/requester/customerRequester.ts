import { apiClient } from '../client';
import type {
  ApiAdminCustomerListItem,
  ApiAdminCustomerDetail,
  ApiAdminCustomerStats,
  AdminCustomerQuery,
} from '@repo/types';

export interface PaginatedCustomersResponse {
  items: ApiAdminCustomerListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const customerRequester = {
  getCustomers: async (
    params?: AdminCustomerQuery,
  ): Promise<PaginatedCustomersResponse> => {
    return apiClient.get<PaginatedCustomersResponse>(
      '/admin/customers',
      params as Record<string, string | number | boolean | undefined>,
    );
  },

  getCustomerStats: async (): Promise<ApiAdminCustomerStats> => {
    return apiClient.get<ApiAdminCustomerStats>('/admin/customers/stats');
  },

  getCustomerById: async (
    id: string,
    revealPii?: boolean,
  ): Promise<ApiAdminCustomerDetail> => {
    return apiClient.get<ApiAdminCustomerDetail>(
      `/admin/customers/${id}`,
      revealPii ? { revealPii: true } : undefined,
    );
  },

  updateCustomerStatus: async (
    id: string,
    payload: {
      status: string;
      statusReason: string;
      durationMinutes?: number;
    },
  ): Promise<ApiAdminCustomerListItem> => {
    return apiClient.patch<ApiAdminCustomerListItem>(
      `/admin/customers/${id}/status`,
      payload,
    );
  },
};
