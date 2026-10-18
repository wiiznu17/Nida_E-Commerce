import { apiClient } from '../client';
import type {
  ApiCmsBanner,
  ApiStoreSettings,
  ApiHomeContentResponse,
} from '@repo/types';
import type {
  SaveCmsBannerDto,
  UpdateStoreSettingsDto,
  ReorderCmsBannersDto,
} from '@repo/validators';

export const contentRequester = {
  async getHomeContent(): Promise<ApiHomeContentResponse> {
    return apiClient.get<ApiHomeContentResponse>('/content/home');
  },

  async getAllBanners(): Promise<ApiCmsBanner[]> {
    return apiClient.get<ApiCmsBanner[]>('/content/banners');
  },

  async getBannerById(id: string): Promise<ApiCmsBanner> {
    return apiClient.get<ApiCmsBanner>(`/content/banners/${id}`);
  },

  async createBanner(payload: SaveCmsBannerDto): Promise<ApiCmsBanner> {
    return apiClient.post<ApiCmsBanner>('/content/banners', payload);
  },

  async updateBanner(
    id: string,
    payload: SaveCmsBannerDto,
  ): Promise<ApiCmsBanner> {
    return apiClient.put<ApiCmsBanner>(`/content/banners/${id}`, payload);
  },

  async deleteBanner(id: string): Promise<boolean> {
    return apiClient.delete<boolean>(`/content/banners/${id}`);
  },

  async reorderBanners(payload: ReorderCmsBannersDto): Promise<boolean> {
    return apiClient.patch<boolean>('/content/banners/reorder', payload);
  },

  async getStoreSettings(): Promise<ApiStoreSettings> {
    return apiClient.get<ApiStoreSettings>('/content/settings');
  },

  async updateStoreSettings(
    payload: UpdateStoreSettingsDto,
  ): Promise<ApiStoreSettings> {
    return apiClient.put<ApiStoreSettings>('/content/settings', payload);
  },
};
