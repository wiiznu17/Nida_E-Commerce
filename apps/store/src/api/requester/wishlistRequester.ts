import { apiClient } from '../client';
import type { ApiWishlistResponse } from '@repo/types';

export const wishlistRequester = {
  /**
   * Fetch all saved wishlist product IDs for the authenticated customer.
   */
  getWishlist: async (token?: string | null): Promise<string[]> => {
    const res = await apiClient.get<ApiWishlistResponse>(
      '/wishlist',
      undefined,
      token,
    );
    return res?.productIds ?? [];
  },

  /**
   * Add product to customer wishlist.
   */
  addToWishlist: async (
    productId: string,
    token?: string | null,
  ): Promise<{ success: boolean; productId: string }> => {
    return apiClient.post<{ success: boolean; productId: string }>(
      `/wishlist/${productId}`,
      undefined,
      token,
    );
  },

  /**
   * Remove product from customer wishlist.
   */
  removeFromWishlist: async (
    productId: string,
    token?: string | null,
  ): Promise<{ success: boolean; productId: string }> => {
    return apiClient.delete<{ success: boolean; productId: string }>(
      `/wishlist/${productId}`,
      token,
    );
  },
};
