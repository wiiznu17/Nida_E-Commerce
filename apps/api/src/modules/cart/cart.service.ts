import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@repo/database';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import type {
  ServerCartItem,
  ServerCartResponse,
  MergeCartPayload,
  UpdateCartItemPayload,
} from '@repo/types';

type VariantWithInventory = Prisma.ProductVariantGetPayload<{
  include: { inventoryItem: true };
}>;

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
      let variant = await this.prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: {
          inventoryItem: true,
          product: {
            select: { isPreorder: true },
          },
        },
      });

      if (!variant) {
        variant = await this.prisma.productVariant.findFirst({
          where: { productId: item.variantId },
          include: {
            inventoryItem: true,
            product: {
              select: { isPreorder: true },
            },
          },
          orderBy: { skuCode: 'asc' },
        });
      }

      if (!variant) continue;

      const resolvedVariantId = variant.id;
      const isPreorder = Boolean(
        variant.isPreorder ?? variant.product?.isPreorder,
      );
      const stockAvailable = variant.inventoryItem?.quantityAvailable ?? 0;
      const maxStock = isPreorder ? 99 : Math.max(stockAvailable, 1);

      const existing = await this.prisma.cartItem.findUnique({
        where: {
          cartId_variantId: {
            cartId,
            variantId: resolvedVariantId,
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
            variantId: resolvedVariantId,
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

    let variant: VariantWithInventory | null =
      await this.prisma.productVariant.findUnique({
        where: { id: variantId },
        include: { inventoryItem: true },
      });

    if (!variant) {
      variant = await this.prisma.productVariant.findFirst({
        where: { productId: variantId },
        include: { inventoryItem: true },
        orderBy: { skuCode: 'asc' },
      });
    }

    if (!variant) {
      throw new NotFoundException(`Product variant ${variantId} not found`);
    }

    const resolvedVariantId = variant.id;

    if (quantity <= 0) {
      await this.prisma.cartItem.deleteMany({
        where: {
          cartId,
          variantId: resolvedVariantId,
        },
      });
    } else {
      const maxStock = variant.inventoryItem?.quantityAvailable ?? 0;
      const safeQty = Math.min(quantity, Math.max(maxStock, 1), 99);

      await this.prisma.cartItem.upsert({
        where: {
          cartId_variantId: {
            cartId,
            variantId: resolvedVariantId,
          },
        },
        update: { quantity: safeQty },
        create: {
          cartId,
          variantId: resolvedVariantId,
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
      const relatedVariants = await this.prisma.productVariant.findMany({
        where: { OR: [{ id: variantId }, { productId: variantId }] },
        select: { id: true },
      });
      const idsToDelete = [
        variantId,
        ...relatedVariants.map((v) => v.id),
      ];

      await this.prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          variantId: { in: idsToDelete },
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
        isActive?: boolean;
        product: {
          id: string;
          name: string;
          nameTh: string | null;
          slug: string;
          basePrice: unknown;
          originalPrice: unknown | null;
          isPreorder: boolean;
          isActive?: boolean;
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
        const isAvailable = Boolean(
          p.isActive !== false && v.isActive !== false,
        );

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
          isActive: isAvailable,
          isAvailable,
        };
      });

    return { items };
  }
}
