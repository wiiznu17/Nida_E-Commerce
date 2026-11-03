import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReviewsService } from '../../src/modules/reviews/reviews.service.js';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { RedisService } from '../../src/core/redis/redis.service.js';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { OrderStatus } from '@repo/database';

describe('ReviewsService (Customer Storefront Domain)', () => {
  let service: ReviewsService;
  let prismaMock: Record<string, unknown>;
  let redisMock: Record<string, unknown>;

  const mockProduct = {
    id: 'prod-uuid-1',
    name: 'Classic Oxford Shirt',
    slug: 'classic-oxford-shirt',
    isActive: true,
    images: [{ imageUrl: 'https://cdn.nida.co/oxford-1.jpg' }],
  };

  beforeEach(() => {
    prismaMock = {
      product: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
      },
      order: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      review: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };

    redisMock = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
    };

    service = new ReviewsService(
      prismaMock as unknown as PrismaService,
      redisMock as unknown as RedisService,
    );
  });

  describe('1. getProductReviews & Rating Statistics Calculation', () => {
    it('calculates average rating and star breakdown accurately for approved reviews', async () => {
      (prismaMock.product as any).findFirst.mockResolvedValue(mockProduct);
      (prismaMock.review as any).findMany
        .mockResolvedValueOnce([
          { rating: 5 },
          { rating: 5 },
          { rating: 4 },
          { rating: 3 },
        ])
        .mockResolvedValueOnce([
          {
            id: 'rev-1',
            productId: mockProduct.id,
            userId: 'user-1',
            rating: 5,
            title: 'Great Shirt',
            reviewText: 'Excellent fabric and fit',
            isVerifiedPurchase: true,
            isApproved: true,
            createdAt: new Date('2026-11-04T10:00:00Z'),
            adminReply: 'Thank you for your review!',
            repliedAt: new Date('2026-11-04T11:00:00Z'),
            user: { firstName: 'Kallaya', lastName: 'Wattana' },
          },
        ]);
      (prismaMock.review as any).count.mockResolvedValue(4);

      const result = await service.getProductReviews(
        mockProduct.id,
        { page: 1, limit: 10 },
        'user-1',
      );

      // (5 + 5 + 4 + 3) / 4 = 17 / 4 = 4.25 -> 4.3 rounded
      expect(result.summary.totalReviews).toBe(4);
      expect(result.summary.averageRating).toBe(4.3);
      expect(result.summary.breakdown[5]).toBe(2);
      expect(result.summary.breakdown[4]).toBe(1);
      expect(result.summary.breakdown[3]).toBe(1);
      expect(result.summary.breakdown[2]).toBe(0);
      expect(result.summary.breakdown[1]).toBe(0);

      // Verify Author Name Masking (PDPA compliance)
      expect(result.reviews[0].authorName).toBe('Kallaya W.');
      expect(result.reviews[0].isOwnReview).toBe(true);
      expect(result.reviews[0].adminReply?.comment).toBe(
        'Thank you for your review!',
      );
    });

    it('returns 0 average rating and empty breakdown when product has no reviews', async () => {
      (prismaMock.product as any).findFirst.mockResolvedValue(mockProduct);
      (prismaMock.review as any).findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      (prismaMock.review as any).count.mockResolvedValue(0);

      const result = await service.getProductReviews(mockProduct.id, {
        page: 1,
        limit: 10,
      });

      expect(result.summary.totalReviews).toBe(0);
      expect(result.summary.averageRating).toBe(0);
      expect(result.reviews).toHaveLength(0);
    });

    it('throws NotFoundException when product does not exist', async () => {
      (prismaMock.product as any).findFirst.mockResolvedValue(null);

      await expect(
        service.getProductReviews('non-existent', { page: 1, limit: 10 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('2. createReview & Verified Buyer Guard', () => {
    it('creates review successfully when customer is a verified buyer with delivered order', async () => {
      (prismaMock.product as any).findFirst.mockResolvedValue(mockProduct);
      (prismaMock.order as any).findFirst.mockResolvedValue({
        id: 'ord-123',
        status: OrderStatus.DELIVERED,
      });
      (prismaMock.review as any).findFirst.mockResolvedValue(null); // No existing review
      (prismaMock.review as any).create.mockResolvedValue({
        id: 'rev-new-1',
        productId: mockProduct.id,
        userId: 'cust-1',
        orderId: 'ord-123',
        rating: 5,
        title: 'Perfect luxury shirt',
        reviewText: 'Impeccable stitching and material.',
        isVerifiedPurchase: true,
        isApproved: true,
        createdAt: new Date('2026-11-04T12:00:00Z'),
        user: { firstName: 'Wissanuray', lastName: 'Potay' },
      });

      const result = await service.createReview('cust-1', mockProduct.id, {
        orderId: 'ord-123',
        rating: 5,
        title: 'Perfect luxury shirt',
        reviewText: 'Impeccable stitching and material.',
      });

      expect(result.id).toBe('rev-new-1');
      expect(result.authorName).toBe('Wissanuray P.');
      expect(result.isVerifiedPurchase).toBe(true);
      expect(result.isOwnReview).toBe(true);
      expect(redisMock.del).toHaveBeenCalledWith(
        `catalog:product:${mockProduct.id}`,
      );
    });

    it('rejects review with ForbiddenException if customer did not purchase or order is not delivered', async () => {
      (prismaMock.product as any).findFirst.mockResolvedValue(mockProduct);
      (prismaMock.order as any).findFirst.mockResolvedValue(null); // No delivered order

      await expect(
        service.createReview('cust-fake', mockProduct.id, {
          orderId: 'ord-not-delivered',
          rating: 5,
          reviewText: 'Great product but not bought',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects duplicate review with ConflictException if product was already reviewed in that order', async () => {
      (prismaMock.product as any).findFirst.mockResolvedValue(mockProduct);
      (prismaMock.order as any).findFirst.mockResolvedValue({
        id: 'ord-123',
        status: OrderStatus.COMPLETED,
      });
      (prismaMock.review as any).findFirst.mockResolvedValue({
        id: 'rev-existing',
      }); // Already reviewed

      await expect(
        service.createReview('cust-1', mockProduct.id, {
          orderId: 'ord-123',
          rating: 4,
          reviewText: 'Trying to review again',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('3. deleteCustomerReview (Right to Erasure / Soft Delete)', () => {
    it('soft deletes review when customer is the true author', async () => {
      (prismaMock.review as any).findUnique.mockResolvedValue({
        id: 'rev-1',
        userId: 'cust-author',
        deletedAt: null,
        product: { id: mockProduct.id, slug: mockProduct.slug },
      });
      (prismaMock.review as any).update.mockResolvedValue({
        id: 'rev-1',
        deletedAt: new Date(),
      });

      const result = await service.deleteCustomerReview('cust-author', 'rev-1');

      expect(result.success).toBe(true);
      expect((prismaMock.review as any).update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'rev-1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
      expect(redisMock.del).toHaveBeenCalledWith(
        `catalog:product:${mockProduct.id}`,
      );
    });

    it('rejects deletion with ForbiddenException if customer is not the review author', async () => {
      (prismaMock.review as any).findUnique.mockResolvedValue({
        id: 'rev-1',
        userId: 'cust-author',
        deletedAt: null,
        product: { id: mockProduct.id, slug: mockProduct.slug },
      });

      await expect(
        service.deleteCustomerReview('attacker-user', 'rev-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException if review does not exist or is already deleted', async () => {
      (prismaMock.review as any).findUnique.mockResolvedValue(null);

      await expect(
        service.deleteCustomerReview('cust-1', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('4. getEligibleItemsForReview', () => {
    it('returns items from delivered orders that have not yet been reviewed', async () => {
      const deliveredOrders = [
        {
          id: 'ord-1',
          orderNumber: 'NIDA-202611-0001',
          placedAt: new Date('2026-11-01T10:00:00Z'),
          items: [
            {
              variantInfoSnapshot: 'Cream / M',
              imageUrlSnapshot: 'https://cdn.nida.co/item1.jpg',
              variant: {
                product: {
                  id: 'prod-1',
                  name: 'Silk Shirt',
                  slug: 'silk-shirt',
                  images: [{ imageUrl: 'https://cdn.nida.co/silk.jpg' }],
                },
              },
            },
            {
              variantInfoSnapshot: 'Navy / L',
              imageUrlSnapshot: 'https://cdn.nida.co/item2.jpg',
              variant: {
                product: {
                  id: 'prod-2',
                  name: 'Wool Blazer',
                  slug: 'wool-blazer',
                  images: [{ imageUrl: 'https://cdn.nida.co/blazer.jpg' }],
                },
              },
            },
          ],
          reviews: [
            { productId: 'prod-1' }, // prod-1 was already reviewed
          ],
        },
      ];

      (prismaMock.order as any).findMany.mockResolvedValue(deliveredOrders);

      const eligible = await service.getEligibleItemsForReview('cust-1');

      // prod-1 was already reviewed in ord-1, so only prod-2 should be eligible
      expect(eligible).toHaveLength(1);
      expect(eligible[0].productId).toBe('prod-2');
      expect(eligible[0].productName).toBe('Wool Blazer');
      expect(eligible[0].orderNumber).toBe('NIDA-202611-0001');
    });
  });
});

