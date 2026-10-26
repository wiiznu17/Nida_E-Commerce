import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import type {
  ServerCartItem,
  ServerCartResponse,
  MergeCartPayload,
  UpdateCartItemPayload,
} from '@repo/types';

@Injectable()
export class CustomerCartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string): Promise<ServerCartResponse> {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: {
                      orderBy: { displayOrder: 'asc' },
                    },
                  },
                },
                inventoryItem: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: {
                        orderBy: { displayOrder: 'asc' },
                      },
                    },
                  },
                  inventoryItem: true,
                },
              },
            },
          },
        },
      });
    }

    return this.mapCartResponse(cart.items);
  }

  async mergeCart(
    userId: string,
    dto: MergeCartPayload,
  ): Promise<ServerCartResponse> {
    const { items: guestItems } = dto;
    if (!guestItems || guestItems.length === 0) {
      return this.getCart(userId);
    }

    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        select: { id: true },
      });
    }

    const cartId = cart.id;

    for (const item of guestItems) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: {
          inventoryItem: true,
        },
      });

      if (!variant) continue;

      const maxStock = variant.inventoryItem?.quantityAvailable ?? 0;
      if (maxStock <= 0) continue;

      const existing = await this.prisma.cartItem.findUnique({
        where: {
          cartId_variantId: {
            cartId,
            variantId: item.variantId,
          },
        },
      });

      if (existing) {
        const newQty = Math.min(existing.quantity + item.quantity, maxStock, 99);
        await this.prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: newQty },
        });
      } else {
        const initialQty = Math.min(item.quantity, maxStock, 99);
        await this.prisma.cartItem.create({
          data: {
            cartId,
            variantId: item.variantId,
            quantity: initialQty,
          },
        });
      }
    }

    return this.getCart(userId);
  }

  async updateItem(
    userId: string,
    dto: UpdateCartItemPayload,
  ): Promise<ServerCartResponse> {
    const { variantId, quantity } = dto;

    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        select: { id: true },
      });
    }

    const cartId = cart.id;

    if (quantity <= 0) {
      await this.prisma.cartItem.deleteMany({
        where: {
          cartId,
          variantId,
        },
      });
    } else {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: variantId },
        include: { inventoryItem: true },
      });

      if (!variant) {
        throw new NotFoundException(`Product variant ${variantId} not found`);
      }

      const maxStock = variant.inventoryItem?.quantityAvailable ?? 0;
      const safeQty = Math.min(quantity, Math.max(maxStock, 1), 99);

      await this.prisma.cartItem.upsert({
        where: {
          cartId_variantId: {
            cartId,
            variantId,
          },
        },
        update: { quantity: safeQty },
        create: {
          cartId,
          variantId,
          quantity: safeQty,
        },
      });
    }

    return this.getCart(userId);
  }

  async removeItem(
    userId: string,
    variantId: string,
  ): Promise<ServerCartResponse> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          variantId,
        },
      });
    }

    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<ServerCartResponse> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return { items: [] };
  }

  private mapCartResponse(
    cartItems: Array<{
      id: string;
      quantity: number;
      variant: {
        id: string;
        skuCode: string;
        size: string;
        colorName: string;
        priceAdjustment: unknown;
        product: {
          id: string;
          name: string;
          nameTh: string | null;
          slug: string;
          basePrice: unknown;
          originalPrice: unknown | null;
          isPreorder: boolean;
          images?: Array<{
            imageUrl: string;
            isPrimary: boolean;
          }>;
        };
        inventoryItem?: {
          quantityAvailable: number;
        } | null;
      };
    }>,
  ): ServerCartResponse {
    const items: ServerCartItem[] = cartItems
      .filter((ci) => ci.variant && ci.variant.product)
      .map((ci) => {
        const v = ci.variant;
        const p = v.product;
        const unitPrice = Number(p.basePrice) + Number(v.priceAdjustment);
        const primaryImage =
          p.images?.find((img) => img.isPrimary)?.imageUrl ??
          p.images?.[0]?.imageUrl ??
          '';
        const stock = v.inventoryItem?.quantityAvailable ?? 0;

        return {
          id: ci.id,
          variantId: v.id,
          productId: p.id,
          name: p.name,
          nameTh: p.nameTh ?? null,
          slug: p.slug,
          sku: v.skuCode,
          size: v.size,
          colorName: v.colorName,
          price: unitPrice,
          basePrice: Number(p.basePrice),
          originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
          image: primaryImage,
          quantity: ci.quantity,
          maxStock: stock,
          isPreorder: p.isPreorder,
        };
      });

    return { items };
  }
}
