import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminReviewsService } from '../../src/modules/reviews/reviews.service.js';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { AuditLogService } from '../../src/modules/audit-log/audit-log.service.js';
import { NotFoundException } from '@nestjs/common';
import { AuditActionType, AdminPermission } from '@repo/types';

describe('AdminReviewsService (Admin Back-Office Domain)', () => {
  let service: AdminReviewsService;
  let prismaMock: Record<string, unknown>;
  let auditLogMock: { recordLog: ReturnType<typeof vi.fn> };

  const mockReview = {
    id: 'rev-uuid-1',
    productId: 'prod-uuid-1',
    userId: 'user-uuid-1',
    orderId: 'ord-uuid-1',
    rating: 5,
    title: 'Very comfortable',
    reviewText: 'Great luxury material and design.',
    isVerifiedPurchase: true,
    isApproved: true,
    adminReply: null,
    repliedAt: null,
    repliedBy: null,
    deletedAt: null,
    createdAt: new Date('2026-11-04T10:00:00Z'),
    updatedAt: new Date('2026-11-04T10:00:00Z'),
    product: {
      id: 'prod-uuid-1',
      name: 'Signature Wool Blazer',
      slug: 'signature-wool-blazer',
      images: [{ imageUrl: 'https://cdn.nida.co/blazer.jpg' }],
    },
    user: {
      firstName: 'Kallaya',
      lastName: 'Wattana',
    },
    repliedByAdmin: null,
  };

  beforeEach(() => {
    prismaMock = {
      review: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    auditLogMock = {
      recordLog: vi.fn().mockResolvedValue(undefined),
    };

    service = new AdminReviewsService(
      prismaMock as unknown as PrismaService,
      auditLogMock as unknown as AuditLogService,
    );
  });

  describe('1. getReviews (Search, Filter & Pagination)', () => {
    it('returns paginated reviews list and masks author names for PDPA compliance', async () => {
      (prismaMock.review as any).findMany.mockResolvedValue([mockReview]);
      (prismaMock.review as any).count.mockResolvedValue(1);

      const result = await service.getReviews({
        page: 1,
        limit: 20,
        status: 'ALL',
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('rev-uuid-1');
      expect(result.data[0].authorName).toBe('Kallaya W.');
      expect(result.data[0].productName).toBe('Signature Wool Blazer');
      expect(result.pagination.total).toBe(1);
    });

    it('filters by status APPROVED and rating', async () => {
      (prismaMock.review as any).findMany.mockResolvedValue([]);
      (prismaMock.review as any).count.mockResolvedValue(0);

      await service.getReviews({
        page: 1,
        limit: 10,
        status: 'APPROVED',
        rating: 5,
      });

      expect((prismaMock.review as any).findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isApproved: true,
            rating: 5,
            deletedAt: null,
          }),
        }),
      );
    });
  });

  describe('2. toggleReviewStatus (Moderation Visibility)', () => {
    it('updates isApproved and records audit log with previous status', async () => {
      (prismaMock.review as any).findUnique.mockResolvedValue(mockReview);
      (prismaMock.review as any).update.mockResolvedValue({
        ...mockReview,
        isApproved: false,
      });

      const result = await service.toggleReviewStatus(
        'rev-uuid-1',
        { isApproved: false },
        'admin-uuid-99',
      );

      expect(result.isApproved).toBe(false);
      expect((prismaMock.review as any).update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'rev-uuid-1' },
          data: { isApproved: false },
        }),
      );

      expect(auditLogMock.recordLog).toHaveBeenCalledWith(
        expect.objectContaining({
          adminId: 'admin-uuid-99',
          actionType: AuditActionType.UPDATE,
          targetTable: 'reviews',
          targetId: 'rev-uuid-1',
          permission: AdminPermission.CATALOG_WRITE,
          oldValuesJson: { isApproved: true },
          newValuesJson: { isApproved: false },
        }),
      );
    });

    it('throws NotFoundException if review does not exist', async () => {
      (prismaMock.review as any).findUnique.mockResolvedValue(null);

      await expect(
        service.toggleReviewStatus(
          'non-existent',
          { isApproved: false },
          'admin-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('3. replyToReview (Brand Official Response)', () => {
    it('saves admin reply and records audit log', async () => {
      (prismaMock.review as any).findUnique.mockResolvedValue(mockReview);
      (prismaMock.review as any).update.mockResolvedValue({
        ...mockReview,
        adminReply: 'Thank you for your feedback! - NIDA Team',
        repliedAt: new Date('2026-11-04T11:00:00Z'),
        repliedBy: 'admin-uuid-99',
      });

      const result = await service.replyToReview(
        'rev-uuid-1',
        { adminReply: 'Thank you for your feedback! - NIDA Team' },
        'admin-uuid-99',
      );

      expect(result.adminReply?.comment).toBe(
        'Thank you for your feedback! - NIDA Team',
      );
      expect(auditLogMock.recordLog).toHaveBeenCalledWith(
        expect.objectContaining({
          adminId: 'admin-uuid-99',
          actionType: AuditActionType.UPDATE,
          targetTable: 'reviews',
          targetId: 'rev-uuid-1',
          permission: AdminPermission.CATALOG_WRITE,
          newValuesJson: expect.objectContaining({
            adminReply: 'Thank you for your feedback! - NIDA Team',
            repliedBy: 'admin-uuid-99',
          }),
        }),
      );
    });
  });

  describe('4. deleteReview (Admin Moderation Soft Delete)', () => {
    it('soft deletes review and stores original text snapshot in audit log oldValuesJson', async () => {
      (prismaMock.review as any).findUnique.mockResolvedValue(mockReview);
      (prismaMock.review as any).update.mockResolvedValue({
        ...mockReview,
        deletedAt: new Date('2026-11-04T12:00:00Z'),
      });

      const result = await service.deleteReview('rev-uuid-1', 'admin-uuid-99');

      expect(result.success).toBe(true);
      expect((prismaMock.review as any).update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'rev-uuid-1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );

      expect(auditLogMock.recordLog).toHaveBeenCalledWith(
        expect.objectContaining({
          adminId: 'admin-uuid-99',
          actionType: AuditActionType.DELETE,
          targetTable: 'reviews',
          targetId: 'rev-uuid-1',
          permission: AdminPermission.CATALOG_WRITE,
          oldValuesJson: expect.objectContaining({
            rating: 5,
            reviewText: 'Great luxury material and design.',
          }),
        }),
      );
    });

    it('throws NotFoundException when trying to delete non-existent review', async () => {
      (prismaMock.review as any).findUnique.mockResolvedValue(null);

      await expect(
        service.deleteReview('non-existent', 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

