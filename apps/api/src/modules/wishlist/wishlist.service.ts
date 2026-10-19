import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import type { ApiWishlistResponse } from '@repo/types';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async getWishlist(userId: string): Promise<ApiWishlistResponse> {
    const items = await this.prisma.wishlist.findMany({
      where: { userId },
      select: { productId: true },
      orderBy: { addedAt: 'desc' },
    });

    return {
      productIds: items.map((item) => item.productId),
    };
  }

  async addToWishlist(
    userId: string,
    productId: string,
  ): Promise<{ success: boolean; productId: string }> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.wishlist.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      create: {
        userId,
        productId,
      },
      update: {},
    });

    return { success: true, productId };
  }

  async removeFromWishlist(
    userId: string,
    productId: string,
  ): Promise<{ success: boolean; productId: string }> {
    await this.prisma.wishlist.deleteMany({
      where: {
        userId,
        productId,
      },
    });

    return { success: true, productId };
  }
}
