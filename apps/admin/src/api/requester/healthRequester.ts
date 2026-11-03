import { apiClient } from '../client';
import type { ApiHealthCheckResponse } from '@repo/types';

export const healthRequester = {
  async getHealthStatus(): Promise<ApiHealthCheckResponse> {
    return apiClient.get<ApiHealthCheckResponse>('/health');
  },
};
