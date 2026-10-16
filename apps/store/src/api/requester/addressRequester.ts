import { apiClient } from '../client';
import type {
  ApiAddress,
  CreateAddressDto,
  UpdateAddressDto,
} from '@repo/types';

export const addressRequester = {
  /**
   * Fetch all saved shipping addresses for current authenticated customer.
   */
  getAddresses: async (token?: string | null): Promise<ApiAddress[]> => {
    return apiClient.get<ApiAddress[]>('/users/addresses', undefined, token);
  },

  /**
   * Create a new shipping address.
   */
  createAddress: async (
    data: CreateAddressDto,
    token?: string | null,
  ): Promise<ApiAddress> => {
    return apiClient.post<ApiAddress>('/users/addresses', data, token);
  },

  /**
   * Update an existing shipping address.
   */
  updateAddress: async (
    id: string,
    data: UpdateAddressDto,
    token?: string | null,
  ): Promise<ApiAddress> => {
    return apiClient.put<ApiAddress>(`/users/addresses/${id}`, data, token);
  },

  /**
   * Delete an existing shipping address.
   */
  deleteAddress: async (
    id: string,
    token?: string | null,
  ): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(
      `/users/addresses/${id}`,
      token,
    );
  },

  /**
   * Set address as primary default shipping address.
   */
  setDefaultAddress: async (
    id: string,
    token?: string | null,
  ): Promise<ApiAddress> => {
    return apiClient.patch<ApiAddress>(
      `/users/addresses/${id}/default`,
      undefined,
      token,
    );
  },
};
