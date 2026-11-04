import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { RedisService } from '../../core/redis/redis.service.js';
import { OrderStatus } from '@repo/database';
import type {
  ApiReview,
  ApiRatingSummary,
  ApiProductReviewsResponse,
  ApiEligibleReviewItem,
} from '@repo/types';
import type { CreateReviewInput, ReviewQueryInput } from '@repo/validators';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Helper: Mask customer name for privacy (e.g., "Kallaya W.")
   */
  private maskCustomerName(
    firstName?: string | null,
    lastName?: string | null,
  ): string {
    if (!firstName && !lastName) {
      return 'NIDA Customer';
    }
    const first = firstName?.trim() ?? '';
    const lastInitial = lastName?.trim()
      ? `${lastName.trim().charAt(0).toUpperCase()}.`
      : '';
    return [first, lastInitial].filter(Boolean).join(' ') || 'NIDA Customer';
  }

  /**
   * Retrieve reviews and rating breakdown for a product
   */
  async getProductReviews(
    productIdOrSlug: string,
    query: ReviewQueryInput,
    currentUserId?: string,
  ): Promise<ApiProductReviewsResponse> {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id: productIdOrSlug }, { slug: productIdOrSlug }],
        isActive: true,
      },
      select: { id: true, name: true, slug: true },
    });

    if (!product) {
      throw new NotFoundException(`Product "${productIdOrSlug}" not found`);
    }

    const { page = 1, limit = 10, rating } = query;
    const whereApproved = {
      productId: product.id,
      isApproved: true,
      deletedAt: null,
    };

    const allApprovedReviews = await this.prisma.review.findMany({
      where: whereApproved,
      select: { rating: true },
    });

    const totalReviews = allApprovedReviews.length;
    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingSum = 0;

    for (const r of allApprovedReviews) {
      if (r.rating >= 1 && r.rating <= 5) {
        breakdown[r.rating as 1 | 2 | 3 | 4 | 5]++;
        ratingSum += r.rating;
      }
    }

    const averageRating =
      totalReviews > 0 ? Math.round((ratingSum / totalReviews) * 10) / 10 : 0;

    const summary: ApiRatingSummary = {
      averageRating,
      totalReviews,
      breakdown,
    };

    const reviewFilter = {
      ...whereApproved,
      ...(rating ? { rating } : {}),
    };

    const totalFiltered = await this.prisma.review.count({
      where: reviewFilter,
    });

    const reviews = await this.prisma.review.findMany({
      where: reviewFilter,
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const mappedReviews: ApiReview[] = reviews.map((r) => ({
      id: r.id,
      productId: r.productId,
      productName: product.name,
      productSlug: product.slug,
      authorName: this.maskCustomerName(r.user?.firstName, r.user?.lastName),
      rating: r.rating,
      title: r.title ?? undefined,
      reviewText: r.reviewText ?? undefined,
      isVerifiedPurchase: r.isVerifiedPurchase,
      isApproved: r.isApproved,
      createdAt: r.createdAt.toISOString(),
      adminReply: r.adminReply
        ? {
            comment: r.adminReply,
            repliedAt: r.repliedAt?.toISOString() ?? r.createdAt.toISOString(),
          }
        : undefined,
      isOwnReview: Boolean(currentUserId && r.userId === currentUserId),
    }));

    return {
      summary,
      reviews: mappedReviews,
      pagination: {
        page,
        limit,
        total: totalFiltered,
        totalPages: Math.ceil(totalFiltered / limit) || 1,
      },
    };
  }

  /**
   * Submit a new product review (Enforces Verified Buyer & Unique constraint)
   */
  async createReview(
    userId: string,
    productIdOrSlug: string,
    dto: CreateReviewInput,
  ): Promise<ApiReview> {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id: productIdOrSlug }, { slug: productIdOrSlug }],
        isActive: true,
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product "${productIdOrSlug}" not found`);
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: dto.orderId,
        userId,
        status: { in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] },
        items: {
          some: {
            variant: {
              productId: product.id,
            },
          },
        },
      },
    });

    if (!order) {
      throw new ForbiddenException(
        'Only verified buyers with delivered orders can review this product',
      );
    }

    const existingReview = await this.prisma.review.findFirst({
      where: {
        productId: product.id,
        userId,
        orderId: dto.orderId,
        deletedAt: null,
      },
    });

    if (existingReview) {
      throw new ConflictException(
        'You have already submitted a review for this product in this order',
      );
    }

    const review = await this.prisma.review.create({
      data: {
        productId: product.id,
        userId,
        orderId: dto.orderId,
        rating: dto.rating,
        title: dto.title?.trim() || null,
        reviewText: dto.reviewText?.trim() || null,
        isVerifiedPurchase: true,
        isApproved: true,
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    await this.invalidateProductCache(product.id, product.slug);

    this.logger.log(
      `Review created: ${review.id} for product "${product.name}" by user ${userId} (Rating: ${review.rating})`,
    );

    return {
      id: review.id,
      productId: review.productId,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.images[0]?.imageUrl,
      authorName: this.maskCustomerName(
        review.user?.firstName,
        review.user?.lastName,
      ),
      rating: review.rating,
      title: review.title ?? undefined,
      reviewText: review.reviewText ?? undefined,
      isVerifiedPurchase: review.isVerifiedPurchase,
      isApproved: review.isApproved,
      createdAt: review.createdAt.toISOString(),
      isOwnReview: true,
    };
  }

  /**
   * Customer deletes their own review (Soft Delete & Re-calculate rating)
   */
  async deleteCustomerReview(
    userId: string,
    reviewId: string,
  ): Promise<{ success: boolean; message: string }> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { product: { select: { id: true, slug: true } } },
    });

    if (!review || review.deletedAt !== null) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.review.update({
      where: { id: reviewId },
      data: { deletedAt: new Date() },
    });

    if (review.product) {
      await this.invalidateProductCache(review.product.id, review.product.slug);
    }

    this.logger.log(
      `Review deleted by customer: ${reviewId} (User: ${userId})`,
    );

    return {
      success: true,
      message: 'Your review has been successfully removed',
    };
  }

  /**
   * Retrieve eligible items for customer to review (Delivered orders where item not yet reviewed)
   */
  async getEligibleItemsForReview(
    userId: string,
  ): Promise<ApiEligibleReviewItem[]> {
    const deliveredOrders = await this.prisma.order.findMany({
      where: {
        userId,
        status: { in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] },
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { where: { isPrimary: true }, take: 1 },
                  },
                },
              },
            },
          },
        },
        reviews: {
          where: { deletedAt: null },
          select: { productId: true },
        },
      },
      orderBy: { placedAt: 'desc' },
    });

    const eligibleItems: ApiEligibleReviewItem[] = [];

    for (const order of deliveredOrders) {
      const reviewedProductIds = new Set(order.reviews.map((r) => r.productId));

      for (const item of order.items) {
        const prod = item.variant?.product;
        if (prod && !reviewedProductIds.has(prod.id)) {
          reviewedProductIds.add(prod.id); // Only 1 review per product in this order

          eligibleItems.push({
            orderId: order.id,
            orderNumber: order.orderNumber,
            productId: prod.id,
            productName: prod.name,
            productSlug: prod.slug,
            productImage:
              prod.images[0]?.imageUrl || item.imageUrlSnapshot || undefined,
            variantInfo: item.variantInfoSnapshot,
            deliveredAt: order.placedAt.toISOString(),
          });
        }
      }
    }

    return eligibleItems;
  }

  /**
   * Invalidate Product Detail Cache
   */
  private async invalidateProductCache(
    productId: string,
    slug: string,
  ): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.del(`catalog:product:${productId}`);
      await this.redis.del(`catalog:product:${slug}`);
    } catch (err) {
      this.logger.warn(`Failed to invalidate redis cache for product: ${err}`);
    }
  }
}
