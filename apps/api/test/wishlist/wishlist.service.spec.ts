import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WishlistService } from '../../src/modules/wishlist/wishlist.service.js';
import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';

describe('WishlistService', () => {
  let service: WishlistService;
  let prismaMock: {
    wishlist: {
      findMany: ReturnType<typeof vi.fn>;
      upsert: ReturnType<typeof vi.fn>;
      deleteMany: ReturnType<typeof vi.fn>;
    };
    product: {
      findUnique: ReturnType<typeof vi.fn>;
    };
  };

  const mockUserId = '11111111-1111-1111-1111-111111111111';
  const mockProductId = '22222222-2222-2222-2222-222222222222';

  beforeEach(() => {
    prismaMock = {
      wishlist: {
        findMany: vi.fn(),
        upsert: vi.fn(),
        deleteMany: vi.fn(),
      },
      product: {
        findUnique: vi.fn(),
      },
    };

    service = new WishlistService(prismaMock as unknown as PrismaService);
  });

  describe('getWishlist', () => {
    it('should return list of productIds for the user', async () => {
      prismaMock.wishlist.findMany.mockResolvedValue([
        { productId: mockProductId },
        { productId: '33333333-3333-3333-3333-333333333333' },
      ]);

      const result = await service.getWishlist(mockUserId);

      expect(prismaMock.wishlist.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        select: { productId: true },
        orderBy: { addedAt: 'desc' },
      });
      expect(result).toEqual({
        productIds: [mockProductId, '33333333-3333-3333-3333-333333333333'],
      });
    });

    it('should return empty productIds array when user has no wishlist items', async () => {
      prismaMock.wishlist.findMany.mockResolvedValue([]);

      const result = await service.getWishlist(mockUserId);

      expect(result).toEqual({ productIds: [] });
    });
  });

  describe('addToWishlist', () => {
    it('should upsert wishlist record when product exists', async () => {
      prismaMock.product.findUnique.mockResolvedValue({ id: mockProductId });
      prismaMock.wishlist.upsert.mockResolvedValue({
        id: 'wish-1',
        userId: mockUserId,
        productId: mockProductId,
        addedAt: new Date(),
      });

      const result = await service.addToWishlist(mockUserId, mockProductId);

      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { id: mockProductId },
        select: { id: true },
      });
      expect(prismaMock.wishlist.upsert).toHaveBeenCalledWith({
        where: {
          userId_productId: {
            userId: mockUserId,
            productId: mockProductId,
          },
        },
        create: {
          userId: mockUserId,
          productId: mockProductId,
        },
        update: {},
      });
      expect(result).toEqual({ success: true, productId: mockProductId });
    });

    it('should throw NotFoundException if product does not exist', async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);

      await expect(
        service.addToWishlist(mockUserId, 'invalid-prod-id'),
      ).rejects.toThrow(NotFoundException);
      expect(prismaMock.wishlist.upsert).not.toHaveBeenCalled();
    });
  });

  describe('removeFromWishlist', () => {
    it('should delete wishlist entry and return success', async () => {
      prismaMock.wishlist.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.removeFromWishlist(mockUserId, mockProductId);

      expect(prismaMock.wishlist.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          productId: mockProductId,
        },
      });
      expect(result).toEqual({ success: true, productId: mockProductId });
    });
  });
});
