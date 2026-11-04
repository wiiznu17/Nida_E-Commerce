import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';
import {
  AdminPermission,
  AuditActionType,
  type ApiReview,
  type PaginatedResponse,
} from '@repo/types';
import type {
  AdminReviewQueryInput,
  AdminUpdateReviewStatusInput,
  AdminReplyReviewInput,
} from '@repo/validators';

@Injectable()
export class AdminReviewsService {
  private readonly logger = new Logger(AdminReviewsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog?: AuditLogService,
  ) {}

  /**
   * Helper: Mask author name for display (e.g., "Kallaya W.")
   */
  private maskCustomerName(
    firstName?: string | null,
    lastName?: string | null,
  ): string {
    if (!firstName && !lastName) return 'NIDA Customer';
    const first = firstName?.trim() ?? '';
    const lastInitial = lastName?.trim()
      ? `${lastName.trim().charAt(0).toUpperCase()}.`
      : '';
    return [first, lastInitial].filter(Boolean).join(' ') || 'NIDA Customer';
  }

  /**
   * Admin lists all reviews with search, filters & pagination
   */
  async getReviews(
    query: AdminReviewQueryInput,
  ): Promise<PaginatedResponse<ApiReview>> {
    const {
      page = 1,
      limit = 20,
      search,
      productId,
      rating,
      status = 'ALL',
    } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (status === 'APPROVED') {
      where.isApproved = true;
    } else if (status === 'HIDDEN') {
      where.isApproved = false;
    }

    if (rating) {
      where.rating = rating;
    }

    if (productId) {
      where.productId = productId;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { reviewText: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
        { product: { name: { contains: q, mode: 'insensitive' } } },
        { user: { firstName: { contains: q, mode: 'insensitive' } } },
        { user: { lastName: { contains: q, mode: 'insensitive' } } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
          user: {
            select: { firstName: true, lastName: true },
          },
          repliedByAdmin: {
            select: { fullName: true, username: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    const items: ApiReview[] = reviews.map((r) => ({
      id: r.id,
      productId: r.productId,
      productName: r.product?.name,
      productSlug: r.product?.slug,
      productImage: r.product?.images[0]?.imageUrl,
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
    }));

    return {
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Admin toggles review visibility (Approved vs Hidden)
   */
  async toggleReviewStatus(
    id: string,
    dto: AdminUpdateReviewStatusInput,
    adminId?: string,
  ): Promise<ApiReview> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, name: true, slug: true } },
        user: { select: { firstName: true, lastName: true } },
      },
    });

    if (!review || review.deletedAt !== null) {
      throw new NotFoundException(`Review #${id} not found`);
    }

    const oldStatus = review.isApproved;
    const updated = await this.prisma.review.update({
      where: { id },
      data: { isApproved: dto.isApproved },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
        user: { select: { firstName: true, lastName: true } },
      },
    });

    if (this.auditLog && adminId) {
      await this.auditLog.recordLog({
        adminId,
        actionType: AuditActionType.UPDATE,
        targetTable: 'reviews',
        targetId: id,
        permission: AdminPermission.CATALOG_WRITE,
        oldValuesJson: { isApproved: oldStatus },
        newValuesJson: { isApproved: dto.isApproved },
      });
    }

    this.logger.log(
      `Review status toggled: #${id} isApproved=${dto.isApproved} by Admin ${adminId}`,
    );

    return {
      id: updated.id,
      productId: updated.productId,
      productName: updated.product?.name,
      productSlug: updated.product?.slug,
      productImage: updated.product?.images[0]?.imageUrl,
      authorName: this.maskCustomerName(
        updated.user?.firstName,
        updated.user?.lastName,
      ),
      rating: updated.rating,
      title: updated.title ?? undefined,
      reviewText: updated.reviewText ?? undefined,
      isVerifiedPurchase: updated.isVerifiedPurchase,
      isApproved: updated.isApproved,
      createdAt: updated.createdAt.toISOString(),
      adminReply: updated.adminReply
        ? {
            comment: updated.adminReply,
            repliedAt:
              updated.repliedAt?.toISOString() ?? updated.createdAt.toISOString(),
          }
        : undefined,
    };
  }

  /**
   * Admin writes official reply to customer review
   */
  async replyToReview(
    id: string,
    dto: AdminReplyReviewInput,
    adminId?: string,
  ): Promise<ApiReview> {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review || review.deletedAt !== null) {
      throw new NotFoundException(`Review #${id} not found`);
    }

    const updated = await this.prisma.review.update({
      where: { id },
      data: {
        adminReply: dto.adminReply.trim(),
        repliedAt: new Date(),
        repliedBy: adminId ?? null,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
        user: { select: { firstName: true, lastName: true } },
      },
    });

    if (this.auditLog && adminId) {
      await this.auditLog.recordLog({
        adminId,
        actionType: AuditActionType.UPDATE,
        targetTable: 'reviews',
        targetId: id,
        permission: AdminPermission.CATALOG_WRITE,
        oldValuesJson: { adminReply: review.adminReply },
        newValuesJson: { adminReply: dto.adminReply.trim(), repliedBy: adminId },
      });
    }

    this.logger.log(`Official reply added to review #${id} by Admin ${adminId}`);

    return {
      id: updated.id,
      productId: updated.productId,
      productName: updated.product?.name,
      productSlug: updated.product?.slug,
      productImage: updated.product?.images[0]?.imageUrl,
      authorName: this.maskCustomerName(
        updated.user?.firstName,
        updated.user?.lastName,
      ),
      rating: updated.rating,
      title: updated.title ?? undefined,
      reviewText: updated.reviewText ?? undefined,
      isVerifiedPurchase: updated.isVerifiedPurchase,
      isApproved: updated.isApproved,
      createdAt: updated.createdAt.toISOString(),
      adminReply: {
        comment: updated.adminReply!,
        repliedAt:
          updated.repliedAt?.toISOString() ?? updated.createdAt.toISOString(),
      },
    };
  }

  /**
   * Admin deletes inappropriate review (Soft Delete + Audit Log)
   */
  async deleteReview(
    id: string,
    adminId?: string,
  ): Promise<{ success: boolean; message: string }> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: { product: { select: { name: true } } },
    });

    if (!review || review.deletedAt !== null) {
      throw new NotFoundException(`Review #${id} not found`);
    }

    await this.prisma.review.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    if (this.auditLog && adminId) {
      await this.auditLog.recordLog({
        adminId,
        actionType: AuditActionType.DELETE,
        targetTable: 'reviews',
        targetId: id,
        permission: AdminPermission.CATALOG_WRITE,
        oldValuesJson: {
          rating: review.rating,
          title: review.title,
          reviewText: review.reviewText,
          userId: review.userId,
          productId: review.productId,
        },
      });
    }

    this.logger.log(`Review #${id} removed by Admin ${adminId}`);

    return {
      success: true,
      message: `Review #${id} has been successfully deleted`,
    };
  }
}

