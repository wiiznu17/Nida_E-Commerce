export interface ApiReviewAdminReply {
  comment: string;
  repliedAt: string;
}

export interface ApiReview {
  id: string;
  productId: string;
  productName?: string;
  productSlug?: string;
  productImage?: string;
  authorName: string;
  rating: number; // 1 - 5
  title?: string;
  reviewText?: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
  adminReply?: ApiReviewAdminReply;
  isOwnReview?: boolean;
}

export interface ApiRatingStarBreakdown {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface ApiRatingSummary {
  averageRating: number;
  totalReviews: number;
  breakdown: ApiRatingStarBreakdown;
}

export interface ApiProductReviewsResponse {
  summary: ApiRatingSummary;
  reviews: ApiReview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiEligibleReviewItem {
  orderId: string;
  orderNumber: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage?: string;
  variantInfo: string;
  deliveredAt: string;
}

export interface CreateReviewDto {
  orderId: string;
  rating: number;
  title?: string;
  reviewText?: string;
}

export interface AdminReviewQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  productId?: string;
  rating?: number;
  status?: 'ALL' | 'APPROVED' | 'HIDDEN';
}

export interface AdminUpdateReviewStatusDto {
  isApproved: boolean;
}

export interface AdminReplyReviewDto {
  adminReply: string;
}

