import { apiClient } from '../client';
import type {
  ApiReview,
  PaginatedResponse,
  AdminReviewQueryDto,
  AdminUpdateReviewStatusDto,
  AdminReplyReviewDto,
} from '@repo/types';

export const reviewRequester = {
  /**
   * Fetch all reviews with pagination, search & filters
   */
  async getReviews(
    params?: AdminReviewQueryDto,
  ): Promise<PaginatedResponse<ApiReview>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.productId) searchParams.set('productId', params.productId);
    if (params?.rating) searchParams.set('rating', String(params.rating));
    if (params?.status && params.status !== 'ALL') {
      searchParams.set('status', params.status);
    }

    const qs = searchParams.toString();
    const endpoint = `/reviews${qs ? `?${qs}` : ''}`;
    return apiClient.get<PaginatedResponse<ApiReview>>(endpoint);
  },

  /**
   * Toggle review visibility (Approve / Hide)
   */
  async toggleReviewStatus(
    id: string,
    isApproved: boolean,
  ): Promise<ApiReview> {
    const payload: AdminUpdateReviewStatusDto = { isApproved };
    return apiClient.patch<ApiReview>(`/reviews/${id}/status`, payload);
  },

  /**
   * Post official admin reply to customer review
   */
  async replyToReview(id: string, adminReply: string): Promise<ApiReview> {
    const payload: AdminReplyReviewDto = { adminReply };
    return apiClient.post<ApiReview>(`/reviews/${id}/reply`, payload);
  },

  /**
   * Soft-delete review with audit log
   */
  async deleteReview(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(
      `/reviews/${id}`,
    );
  },
};
