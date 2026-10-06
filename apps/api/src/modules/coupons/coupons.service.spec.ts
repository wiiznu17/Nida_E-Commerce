import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CouponsService } from './coupons.service.js';
import { DiscountType } from '@repo/types';

describe('CouponsService', () => {
  let service: CouponsService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      promotionCoupon: {
        findUnique: vi.fn(),
        count: vi.fn(),
      },
      couponRedemption: {
        count: vi.fn(),
      },
      productVariant: {
        findMany: vi.fn(),
      },
    };

    service = new CouponsService(prismaMock);
  });

  describe('validateCoupon', () => {
    it('returns NOT_FOUND when coupon code does not exist', async () => {
      prismaMock.promotionCoupon.findUnique.mockResolvedValue(null);

      const result = await service.validateCoupon({
        code: 'NONEXISTENT',
        orderAmount: 1500,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('NOT_FOUND');
    });

    it('returns INACTIVE when coupon is deactivated', async () => {
      prismaMock.promotionCoupon.findUnique.mockResolvedValue({
        id: 'coupon-1',
        code: 'INACTIVE10',
        isActive: false,
        startsAt: new Date(Date.now() - 10000),
        expiresAt: new Date(Date.now() + 100000),
      });

      const result = await service.validateCoupon({
        code: 'INACTIVE10',
        orderAmount: 1500,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('INACTIVE');
    });

    it('returns EXPIRED when coupon expiration date has passed', async () => {
      prismaMock.promotionCoupon.findUnique.mockResolvedValue({
        id: 'coupon-1',
        code: 'EXPIRED10',
        isActive: true,
        startsAt: new Date(Date.now() - 100000),
        expiresAt: new Date(Date.now() - 1000),
      });

      const result = await service.validateCoupon({
        code: 'EXPIRED10',
        orderAmount: 1500,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('EXPIRED');
    });

    it('returns MIN_ORDER_NOT_MET when order amount is less than minOrderAmount', async () => {
      prismaMock.promotionCoupon.findUnique.mockResolvedValue({
        id: 'coupon-1',
        code: 'MIN500',
        isActive: true,
        startsAt: new Date(Date.now() - 10000),
        expiresAt: new Date(Date.now() + 100000),
        totalUsageLimit: 100,
        currentUsageCount: 5,
        minOrderAmount: 1000,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 100,
      });

      const result = await service.validateCoupon({
        code: 'MIN500',
        orderAmount: 500,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('MIN_ORDER_NOT_MET');
    });

    it('correctly calculates percentage discount with maxDiscountAmount cap', async () => {
      prismaMock.promotionCoupon.findUnique.mockResolvedValue({
        id: 'coupon-1',
        code: 'SAVE20',
        isActive: true,
        startsAt: new Date(Date.now() - 10000),
        expiresAt: new Date(Date.now() + 100000),
        totalUsageLimit: 100,
        currentUsageCount: 0,
        userUsageLimit: 1,
        minOrderAmount: 500,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
        maxDiscountAmount: 200,
      });

      // 20% of 2000 is 400, but capped at 200
      const result = await service.validateCoupon({
        code: 'SAVE20',
        orderAmount: 2000,
      });

      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(200);
      expect(result.coupon?.code).toBe('SAVE20');
    });
  });

  describe('calculateCheckout', () => {
    it('calculates line items, shipping, pro-rata discount, and tax correctly', async () => {
      prismaMock.productVariant.findMany.mockResolvedValue([
        {
          id: 'v1',
          colorName: 'Navy',
          size: 'M',
          weightGrams: 300,
          priceAdjustment: 0,
          product: {
            name: 'Classic Oxford Shirt',
            basePrice: 1000,
          },
        },
        {
          id: 'v2',
          colorName: 'Beige',
          size: 'L',
          weightGrams: 500,
          priceAdjustment: 200,
          product: {
            name: 'Pleated Chino Trousers',
            basePrice: 1500,
          },
        },
      ]);

      prismaMock.promotionCoupon.findUnique.mockResolvedValue({
        id: 'c1',
        code: 'SAVE100',
        isActive: true,
        startsAt: new Date(Date.now() - 10000),
        expiresAt: new Date(Date.now() + 100000),
        totalUsageLimit: 100,
        currentUsageCount: 0,
        userUsageLimit: 1,
        minOrderAmount: 500,
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 100,
        maxDiscountAmount: null,
      });

      const calculation = await service.calculateCheckout({
        items: [
          { variantId: 'v1', quantity: 1 },
          { variantId: 'v2', quantity: 1 },
        ],
        couponCode: 'SAVE100',
      });

      // Item 1: 1000, Item 2: 1700 => Subtotal = 2700
      expect(calculation.subtotal).toBe(2700);
      expect(calculation.shippingFee).toBe(0); // >= 1000 threshold
      expect(calculation.discountTotal).toBe(100);
      expect(calculation.totalAmount).toBe(2600);

      // Verify pro-rata distribution across items sums to total discount exactly
      const sumAllocated = calculation.items.reduce(
        (sum, item) => sum + item.discountShare,
        0,
      );
      expect(sumAllocated).toBe(100);
      expect(calculation.items[0]?.netPrice).toBe(1000 - calculation.items[0]!.discountShare);
      expect(calculation.items[1]?.netPrice).toBe(1700 - calculation.items[1]!.discountShare);
    });

    it('charges standard shipping fee when subtotal is below threshold', async () => {
      prismaMock.productVariant.findMany.mockResolvedValue([
        {
          id: 'v1',
          colorName: 'Navy',
          size: 'M',
          weightGrams: 200,
          priceAdjustment: 0,
          product: {
            name: 'Cotton Socks',
            basePrice: 400,
          },
        },
      ]);

      const calculation = await service.calculateCheckout({
        items: [{ variantId: 'v1', quantity: 1 }],
      });

      expect(calculation.subtotal).toBe(400);
      expect(calculation.shippingFee).toBe(50);
      expect(calculation.totalAmount).toBe(450);
    });
  });
});
