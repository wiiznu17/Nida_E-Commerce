import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CouponsService } from '../../src/modules/coupons/coupons.service.js';
import { DiscountType } from '@repo/types';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';

describe('CouponsService (apps/api)', () => {
  let service: CouponsService;
  let prismaMock: {
    promotionCoupon: {
      findUnique: ReturnType<typeof vi.fn>;
    };
    couponRedemption: {
      count: ReturnType<typeof vi.fn>;
    };
    productVariant: {
      findMany: ReturnType<typeof vi.fn>;
    };
    storeSettings: {
      findFirst: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prismaMock = {
      promotionCoupon: {
        findUnique: vi.fn(),
      },
      couponRedemption: {
        count: vi.fn(),
      },
      productVariant: {
        findMany: vi.fn(),
      },
      storeSettings: {
        findFirst: vi.fn(),
      },
    };

    service = new CouponsService(prismaMock as unknown as PrismaService);
  });

  describe('validateCoupon', () => {
    const baseValidCoupon = {
      id: 'c-1',
      code: 'NIDA20',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 20,
      minOrderAmount: 1000,
      maxDiscountAmount: 500,
      totalUsageLimit: 100,
      userUsageLimit: 1,
      currentUsageCount: 5,
      startsAt: new Date(Date.now() - 3600 * 1000),
      expiresAt: new Date(Date.now() + 3600 * 1000),
      isActive: true,
      applicableTier: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('validates a percentage coupon and calculates discount within cap', async () => {
      prismaMock.promotionCoupon.findUnique.mockResolvedValue(baseValidCoupon);

      const result = await service.validateCoupon({
        code: 'nida20',
        orderAmount: 2000,
      });

      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(400); // 20% of 2000 is 400 <= 500 cap
      expect(result.coupon?.code).toBe('NIDA20');
    });

    it('caps the percentage discount at maxDiscountAmount', async () => {
      prismaMock.promotionCoupon.findUnique.mockResolvedValue(baseValidCoupon);

      const result = await service.validateCoupon({
        code: 'NIDA20',
        orderAmount: 3000, // 20% is 600, cap is 500
      });

      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(500);
    });

    it('validates a fixed amount coupon', async () => {
      prismaMock.promotionCoupon.findUnique.mockResolvedValue({
        ...baseValidCoupon,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 300,
        maxDiscountAmount: null,
      });

      const result = await service.validateCoupon({
        code: 'SAVE300',
        orderAmount: 1500,
      });

      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(300);
    });

    it('validates a free shipping coupon with standard shipping fee reduction', async () => {
      prismaMock.promotionCoupon.findUnique.mockResolvedValue({
        ...baseValidCoupon,
        discountType: DiscountType.FREE_SHIPPING,
        discountValue: 0,
      });

      const result = await service.validateCoupon({
        code: 'FREESHIP',
        orderAmount: 1200,
      });

      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(50);
    });

    it('rejects with NOT_FOUND if coupon does not exist', async () => {
      prismaMock.promotionCoupon.findUnique.mockResolvedValue(null);

      const result = await service.validateCoupon({
        code: 'INVALID',
        orderAmount: 1000,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('NOT_FOUND');
    });

    it('rejects with INACTIVE if coupon is turned off', async () => {
      prismaMock.promotionCoupon.findUnique.mockResolvedValue({
        ...baseValidCoupon,
        isActive: false,
      });

      const result = await service.validateCoupon({
        code: 'NIDA20',
        orderAmount: 1500,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('INACTIVE');
    });

    it('rejects with NOT_YET_ACTIVE if coupon starts in the future', async () => {
      prismaMock.promotionCoupon.findUnique.mockResolvedValue({
        ...baseValidCoupon,
        startsAt: new Date(Date.now() + 86400 * 1000),
      });

      const result = await service.validateCoupon({
        code: 'NIDA20',
        orderAmount: 1500,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('NOT_YET_ACTIVE');
    });

    it('rejects with EXPIRED if coupon has passed expiration date', async () => {
      prismaMock.promotionCoupon.findUnique.mockResolvedValue({
        ...baseValidCoupon,
        expiresAt: new Date(Date.now() - 1000),
      });

      const result = await service.validateCoupon({
        code: 'NIDA20',
        orderAmount: 1500,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('EXPIRED');
    });

    it('rejects with USAGE_LIMIT_REACHED if total usage quota is exhausted', async () => {
      prismaMock.promotionCoupon.findUnique.mockResolvedValue({
        ...baseValidCoupon,
        totalUsageLimit: 100,
        currentUsageCount: 100,
      });

      const result = await service.validateCoupon({
        code: 'NIDA20',
        orderAmount: 1500,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('USAGE_LIMIT_REACHED');
    });

    it('rejects with USER_LIMIT_REACHED if user has reached their redemption quota', async () => {
      prismaMock.promotionCoupon.findUnique.mockResolvedValue(baseValidCoupon);
      prismaMock.couponRedemption.count.mockResolvedValue(1);

      const result = await service.validateCoupon({
        code: 'NIDA20',
        orderAmount: 1500,
        userId: 'user-uuid-1',
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('USER_LIMIT_REACHED');
    });

    it('rejects with MIN_ORDER_NOT_MET if order amount is below minimum required', async () => {
      prismaMock.promotionCoupon.findUnique.mockResolvedValue(baseValidCoupon);

      const result = await service.validateCoupon({
        code: 'NIDA20',
        orderAmount: 999, // Min is 1000
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('MIN_ORDER_NOT_MET');
    });

    it('accepts order amount exactly matching minimum order amount', async () => {
      prismaMock.promotionCoupon.findUnique.mockResolvedValue(baseValidCoupon);

      const result = await service.validateCoupon({
        code: 'NIDA20',
        orderAmount: 1000,
      });

      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(200);
    });
  });

  describe('calculateCheckout', () => {
    const mockVariants = [
      {
        id: 'var-1',
        weightGrams: 200,
        colorName: 'Espresso',
        size: 'M',
        priceAdjustment: 0,
        product: {
          name: 'Varsity Tee',
          basePrice: 500,
        },
      },
      {
        id: 'var-2',
        weightGrams: 300,
        colorName: 'White',
        size: 'L',
        priceAdjustment: 100,
        product: {
          name: 'Heritage Polo',
          basePrice: 700,
        },
      },
    ];

    it('calculates line items, subtotal, shipping, and tax without coupon', async () => {
      prismaMock.productVariant.findMany.mockResolvedValue(mockVariants);
      prismaMock.storeSettings.findFirst.mockResolvedValue({
        freeShippingThreshold: 2000,
      });

      const result = await service.calculateCheckout({
        items: [
          { variantId: 'var-1', quantity: 2 }, // 2 * 500 = 1000
          { variantId: 'var-2', quantity: 1 }, // 1 * (700+100) = 800
        ],
      });

      expect(result.subtotal).toBe(1800);
      expect(result.shippingFee).toBe(50); // 1800 < 2000 free threshold
      expect(result.discountTotal).toBe(0);
      expect(result.totalAmount).toBe(1850);
      expect(result.items).toHaveLength(2);
      expect(result.items[0]!.subtotal).toBe(1000);
      expect(result.items[1]!.subtotal).toBe(800);
    });

    it('applies free shipping when subtotal reaches free shipping threshold', async () => {
      prismaMock.productVariant.findMany.mockResolvedValue(mockVariants);
      prismaMock.storeSettings.findFirst.mockResolvedValue({
        freeShippingThreshold: 1500,
      });

      const result = await service.calculateCheckout({
        items: [
          { variantId: 'var-1', quantity: 2 }, // 1000
          { variantId: 'var-2', quantity: 1 }, // 800 -> 1800
        ],
      });

      expect(result.subtotal).toBe(1800);
      expect(result.shippingFee).toBe(0);
      expect(result.totalAmount).toBe(1800);
    });

    it('applies coupon and distributes discount pro-rata across items', async () => {
      prismaMock.productVariant.findMany.mockResolvedValue(mockVariants);
      prismaMock.storeSettings.findFirst.mockResolvedValue({
        freeShippingThreshold: 1000,
      });

      prismaMock.promotionCoupon.findUnique.mockResolvedValue({
        id: 'c-promo',
        code: 'PROMO10',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        minOrderAmount: 500,
        maxDiscountAmount: null,
        totalUsageLimit: 1000,
        userUsageLimit: 1,
        currentUsageCount: 0,
        startsAt: new Date(Date.now() - 3600 * 1000),
        expiresAt: new Date(Date.now() + 3600 * 1000),
        isActive: true,
        applicableTier: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.calculateCheckout({
        items: [
          { variantId: 'var-1', quantity: 2 }, // 1000 (1000/1800 of 180 = 100)
          { variantId: 'var-2', quantity: 1 }, // 800  (800/1800 of 180 = 80)
        ],
        couponCode: 'PROMO10',
      });

      expect(result.subtotal).toBe(1800);
      expect(result.discountTotal).toBe(180);
      expect(result.couponApplied?.code).toBe('PROMO10');
      expect(result.items[0]!.discountShare).toBe(100);
      expect(result.items[0]!.netPrice).toBe(900);
      expect(result.items[1]!.discountShare).toBe(80);
      expect(result.items[1]!.netPrice).toBe(720);
      expect(result.totalAmount).toBe(1620);
    });

    it('throws BadRequestException if items array is empty', async () => {
      await expect(
        service.calculateCheckout({
          items: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException if variant does not exist', async () => {
      prismaMock.productVariant.findMany.mockResolvedValue([]);

      await expect(
        service.calculateCheckout({
          items: [{ variantId: 'var-non-existent', quantity: 1 }],
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
