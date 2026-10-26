import { apiClient } from '../client';
import type {
  ServerCartResponse,
  MergeCartPayload,
  UpdateCartItemPayload,
} from '@repo/types';

export const cartRequester = {
  /**
   * Fetch current authenticated customer cart from backend database.
   */
  getCart: async (token: string): Promise<ServerCartResponse> => {
    try {
      const data = await apiClient.get<ServerCartResponse>(
        '/cart',
        undefined,
        token,
      );
      return data ?? { items: [] };
    } catch (err) {
      console.warn('[cartRequester] getCart error:', err);
      return { items: [] };
    }
  },

  /**
   * Merge guest cart items into customer account upon login.
   */
  mergeCart: async (
    items: Array<{ variantId: string; quantity: number }>,
    token: string,
  ): Promise<ServerCartResponse> => {
    try {
      const payload: MergeCartPayload = { items };
      const data = await apiClient.post<ServerCartResponse>(
        '/cart/merge',
        payload,
        token,
      );
      return data ?? { items: [] };
    } catch (err) {
      console.warn('[cartRequester] mergeCart error:', err);
      return { items: [] };
    }
  },

  /**
   * Update item quantity in database cart.
   */
  updateItem: async (
    variantId: string,
    quantity: number,
    token: string,
  ): Promise<ServerCartResponse> => {
    try {
      const payload: UpdateCartItemPayload = { variantId, quantity };
      const data = await apiClient.put<ServerCartResponse>(
        '/cart/items',
        payload,
        token,
      );
      return data ?? { items: [] };
    } catch (err) {
      console.warn('[cartRequester] updateItem error:', err);
      return { items: [] };
    }
  },

  /**
   * Remove a specific variant item from database cart.
   */
  removeItem: async (
    variantId: string,
    token: string,
  ): Promise<ServerCartResponse> => {
    try {
      const data = await apiClient.delete<ServerCartResponse>(
        `/cart/items/${encodeURIComponent(variantId)}`,
        token,
      );
      return data ?? { items: [] };
    } catch (err) {
      console.warn('[cartRequester] removeItem error:', err);
      return { items: [] };
    }
  },

  /**
   * Clear all items from customer cart in database.
   */
  clearCart: async (token: string): Promise<ServerCartResponse> => {
    try {
      const data = await apiClient.delete<ServerCartResponse>('/cart', token);
      return data ?? { items: [] };
    } catch (err) {
      console.warn('[cartRequester] clearCart error:', err);
      return { items: [] };
    }
  },
};
