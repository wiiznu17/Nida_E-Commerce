import { apiClient } from '../client';
import type {
  ApiProductReviewsResponse,
  ApiReview,
  ApiEligibleReviewItem,
  CreateReviewDto,
} from '@repo/types';

export const reviewRequester = {
  /**
   * Fetch approved reviews & rating summary for a product
   */
  async getProductReviews(
    productId: string,
    params?: { page?: number; limit?: number; rating?: number },
    token?: string | null,
  ): Promise<ApiProductReviewsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.rating) searchParams.set('rating', String(params.rating));

    const qs = searchParams.toString();
    const endpoint = `/products/${productId}/reviews${qs ? `?${qs}` : ''}`;
    return apiClient.get<ApiProductReviewsResponse>(
      endpoint,
      undefined,
      token ?? undefined,
    );
  },

  /**
   * Get delivered items eligible for review by logged-in customer
   */
  async getEligibleItems(token: string): Promise<ApiEligibleReviewItem[]> {
    return apiClient.get<ApiEligibleReviewItem[]>(
      '/customer/reviews/eligible',
      undefined,
      token,
    );
  },

  /**
   * Submit a new review for a product (Verified Buyer Only)
   */
  async createReview(
    productId: string,
    dto: CreateReviewDto,
    token: string,
  ): Promise<ApiReview> {
    return apiClient.post<ApiReview>(
      `/products/${productId}/reviews`,
      dto,
      token,
    );
  },

  /**
   * Customer soft-deletes their own review
   */
  async deleteReview(
    reviewId: string,
    token: string,
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(
      `/customer/reviews/${reviewId}`,
      token,
    );
  },
};
