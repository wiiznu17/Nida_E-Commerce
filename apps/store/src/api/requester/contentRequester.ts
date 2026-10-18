import { apiClient } from '../client';
import type { ApiHomeContentResponse, ApiStoreSettings } from '@repo/types';

export const contentRequester = {
  async getHomeContent(): Promise<ApiHomeContentResponse> {
    return apiClient.get<ApiHomeContentResponse>('/content/home');
  },

  async getStoreSettings(): Promise<ApiStoreSettings> {
    return apiClient.get<ApiStoreSettings>('/content/settings');
  },
};
