import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CustomerCartService } from '../../src/modules/cart/cart.service.js';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';

describe('CustomerCartService', () => {
  let service: CustomerCartService;
  let prismaMock: {
    cart: {
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
    cartItem: {
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      deleteMany: ReturnType<typeof vi.fn>;
      upsert: ReturnType<typeof vi.fn>;
    };
    productVariant: {
      findUnique: ReturnType<typeof vi.fn>;
    };
  };

  const sampleCartWithItems = {
    id: 'cart-1',
    userId: 'user-1',
    items: [
      {
        id: 'ci-1',
        quantity: 2,
        variant: {
          id: 'var-1',
          skuCode: 'NIDA-M1-S',
          size: 'S',
          colorName: 'Espresso',
          priceAdjustment: 20,
          product: {
            id: 'prod-1',
            name: 'Polo Shirt',
            nameTh: 'เสื้อโปโล',
            slug: 'polo-shirt',
            basePrice: 100,
            originalPrice: 150,
            isPreorder: false,
            images: [{ imageUrl: 'https://example.com/polo.jpg', isPrimary: true }],
          },
          inventoryItem: { quantityAvailable: 10 },
        },
      },
    ],
  };

  beforeEach(() => {
    prismaMock = {
      cart: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      cartItem: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        deleteMany: vi.fn(),
        upsert: vi.fn(),
      },
      productVariant: {
        findUnique: vi.fn(),
      },
    };

    service = new CustomerCartService(prismaMock as unknown as PrismaService);
  });

  describe('getCart', () => {
    it('returns mapped cart items when cart exists', async () => {
      prismaMock.cart.findUnique.mockResolvedValue(sampleCartWithItems);

      const res = await service.getCart('user-1');
      expect(res.items).toHaveLength(1);
      expect(res.items[0]).toEqual({
        id: 'ci-1',
        variantId: 'var-1',
        productId: 'prod-1',
        name: 'Polo Shirt',
        nameTh: 'เสื้อโปโล',
        slug: 'polo-shirt',
        sku: 'NIDA-M1-S',
        size: 'S',
        colorName: 'Espresso',
        price: 120, // 100 + 20
        basePrice: 100,
        originalPrice: 150,
        image: 'https://example.com/polo.jpg',
        quantity: 2,
        maxStock: 10,
        isPreorder: false,
      });
    });

    it('creates a new cart if not found and returns empty items', async () => {
      prismaMock.cart.findUnique.mockResolvedValue(null);
      prismaMock.cart.create.mockResolvedValue({ id: 'cart-new', userId: 'user-2', items: [] });

      const res = await service.getCart('user-2');
      expect(prismaMock.cart.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: { userId: 'user-2' } }),
      );
      expect(res.items).toEqual([]);
    });
  });

  describe('mergeCart', () => {
    it('returns existing cart directly if guestItems is empty', async () => {
      prismaMock.cart.findUnique.mockResolvedValue(sampleCartWithItems);

      const res = await service.mergeCart('user-1', { items: [] });
      expect(res.items).toHaveLength(1);
      expect(prismaMock.cartItem.create).not.toHaveBeenCalled();
    });

    it('merges new guest items into user cart when valid and in stock', async () => {
      prismaMock.cart.findUnique.mockResolvedValue({ id: 'cart-1', userId: 'user-1', items: [] });
      prismaMock.productVariant.findUnique.mockResolvedValue({
        id: 'var-2',
        inventoryItem: { quantityAvailable: 5 },
      });
      prismaMock.cartItem.findUnique.mockResolvedValue(null);

      // On second findUnique for getCart
      prismaMock.cart.findUnique
        .mockResolvedValueOnce({ id: 'cart-1', userId: 'user-1' })
        .mockResolvedValueOnce(sampleCartWithItems);

      const res = await service.mergeCart('user-1', {
        items: [{ variantId: 'var-2', quantity: 2 }],
      });

      expect(prismaMock.cartItem.create).toHaveBeenCalledWith({
        data: {
          cartId: 'cart-1',
          variantId: 'var-2',
          quantity: 2,
        },
      });
      expect(res.items).toBeDefined();
    });
  });

  describe('updateItem', () => {
    it('deletes cart item if quantity is 0 or negative', async () => {
      prismaMock.cart.findUnique
        .mockResolvedValueOnce({ id: 'cart-1', userId: 'user-1' })
        .mockResolvedValueOnce({ id: 'cart-1', userId: 'user-1', items: [] });

      await service.updateItem('user-1', { variantId: 'var-1', quantity: 0 });

      expect(prismaMock.cartItem.deleteMany).toHaveBeenCalledWith({
        where: {
          cartId: 'cart-1',
          variantId: 'var-1',
        },
      });
    });

    it('upserts cart item with capped quantity when quantity > 0', async () => {
      prismaMock.cart.findUnique
        .mockResolvedValueOnce({ id: 'cart-1', userId: 'user-1' })
        .mockResolvedValueOnce(sampleCartWithItems);
      prismaMock.productVariant.findUnique.mockResolvedValue({
        id: 'var-1',
        inventoryItem: { quantityAvailable: 10 },
      });

      await service.updateItem('user-1', { variantId: 'var-1', quantity: 4 });

      expect(prismaMock.cartItem.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: { quantity: 4 },
          create: expect.objectContaining({ quantity: 4 }),
        }),
      );
    });
  });

  describe('removeItem', () => {
    it('deletes specific variant item from cart', async () => {
      prismaMock.cart.findUnique
        .mockResolvedValueOnce({ id: 'cart-1', userId: 'user-1' })
        .mockResolvedValueOnce({ id: 'cart-1', userId: 'user-1', items: [] });

      await service.removeItem('user-1', 'var-1');

      expect(prismaMock.cartItem.deleteMany).toHaveBeenCalledWith({
        where: {
          cartId: 'cart-1',
          variantId: 'var-1',
        },
      });
    });
  });

  describe('clearCart', () => {
    it('deletes all cart items for cartId and returns empty items', async () => {
      prismaMock.cart.findUnique.mockResolvedValue({ id: 'cart-1', userId: 'user-1' });

      const res = await service.clearCart('user-1');

      expect(prismaMock.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: 'cart-1' },
      });
      expect(res.items).toEqual([]);
    });
  });
});
