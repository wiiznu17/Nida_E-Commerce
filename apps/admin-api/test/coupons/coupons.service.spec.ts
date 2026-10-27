import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CouponsService } from '../../src/modules/coupons/coupons.service.js';
import { DiscountType } from '@repo/types';
import { ConflictException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';

describe('CouponsService', () => {
  let service: CouponsService;
  let prismaMock: {
    promotionCoupon: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
    };
    couponRedemption: {
      count: ReturnType<typeof vi.fn>;
    };
    productVariant: {
      findMany: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prismaMock = {
      promotionCoupon: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      couponRedemption: {
        count: vi.fn(),
      },
      productVariant: {
        findMany: vi.fn(),
      },
    };

    service = new CouponsService(prismaMock as unknown as PrismaService);
  });

  describe('getAllCoupons', () => {
    it('returns list of mapped coupons sorted by createdAt desc', async () => {
      prismaMock.promotionCoupon.findMany.mockResolvedValue([
        {
          id: 'c1',
          code: 'NIDA20',
          discountType: DiscountType.PERCENTAGE,
          discountValue: 20,
          minOrderAmount: 100,
          maxDiscountAmount: 50,
          totalUsageLimit: 500,
          userUsageLimit: 1,
          currentUsageCount: 25,
          applicableTier: null,
          startsAt: new Date('2026-01-01'),
          expiresAt: new Date('2026-12-31'),
          isActive: true,
        },
      ]);

      const result = await service.getAllCoupons();
      expect(result).toHaveLength(1);
      expect(result[0]?.code).toBe('NIDA20');
      expect(result[0]?.discountType).toBe(DiscountType.PERCENTAGE);
      expect(result[0]?.discountValue).toBe(20);
      expect(prismaMock.promotionCoupon.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('createCoupon', () => {
    it('throws ConflictException if coupon code already exists', async () => {
      prismaMock.promotionCoupon.findUnique.mockResolvedValue({
        id: 'existing-id',
        code: 'NIDA20',
      });

      await expect(
        service.createCoupon({
          code: 'NIDA20',
          discountType: DiscountType.PERCENTAGE,
          discountValue: 20,
          expiresAt: '2026-12-31T23:59:59Z',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('creates coupon successfully with uppercase code', async () => {
      prismaMock.promotionCoupon.findUnique.mockResolvedValue(null);
      prismaMock.promotionCoupon.create.mockResolvedValue({
        id: 'new-id',
        code: 'WELCOME10',
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 10,
        minOrderAmount: 50,
        maxDiscountAmount: null,
        totalUsageLimit: 100,
        userUsageLimit: 1,
        currentUsageCount: 0,
        applicableTier: null,
        startsAt: new Date('2026-01-01'),
        expiresAt: new Date('2026-12-31'),
        isActive: true,
      });

      const result = await service.createCoupon({
        code: 'welcome10',
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 10,
        minOrderAmount: 50,
        expiresAt: '2026-12-31T23:59:59Z',
      });

      expect(result.id).toBe('new-id');
      expect(result.code).toBe('WELCOME10');
      expect(prismaMock.promotionCoupon.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            code: 'WELCOME10',
            discountType: DiscountType.FIXED_AMOUNT,
          }),
        }),
      );
    });
  });

  describe('toggleCoupon', () => {
    it('toggles coupon isActive state when found', async () => {
      prismaMock.promotionCoupon.findFirst.mockResolvedValue({
        id: 'c1',
        code: 'TEST',
        isActive: true,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        minOrderAmount: 0,
        maxDiscountAmount: null,
        totalUsageLimit: 100,
        userUsageLimit: 1,
        currentUsageCount: 0,
        applicableTier: null,
        startsAt: new Date('2026-01-01'),
        expiresAt: new Date('2026-12-31'),
      });

      prismaMock.promotionCoupon.update.mockResolvedValue({
        id: 'c1',
        code: 'TEST',
        isActive: false,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        minOrderAmount: 0,
        maxDiscountAmount: null,
        totalUsageLimit: 100,
        userUsageLimit: 1,
        currentUsageCount: 0,
        applicableTier: null,
        startsAt: new Date('2026-01-01'),
        expiresAt: new Date('2026-12-31'),
      });

      const result = await service.toggleCoupon('c1');
      expect(result.isActive).toBe(false);
      expect(prismaMock.promotionCoupon.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { isActive: false },
      });
    });

    it('throws NotFoundException when coupon is not found', async () => {
      prismaMock.promotionCoupon.findFirst.mockResolvedValue(null);

      await expect(service.toggleCoupon('UNKNOWN')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteCoupon', () => {
    it('deletes coupon successfully when found', async () => {
      prismaMock.promotionCoupon.findFirst.mockResolvedValue({
        id: 'c1',
        code: 'DELETE_ME',
      });
      prismaMock.promotionCoupon.delete.mockResolvedValue({ id: 'c1' });

      const result = await service.deleteCoupon('DELETE_ME');
      expect(result).toEqual({ success: true, id: 'c1' });
      expect(prismaMock.promotionCoupon.delete).toHaveBeenCalledWith({
        where: { id: 'c1' },
      });
    });

    it('throws NotFoundException when coupon to delete is not found', async () => {
      prismaMock.promotionCoupon.findFirst.mockResolvedValue(null);

      await expect(service.deleteCoupon('UNKNOWN')).rejects.toThrow(
        NotFoundException,
      );
    });
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

    it('validates a free shipping coupon for orders below free shipping threshold', async () => {
      prismaMock.promotionCoupon.findUnique.mockResolvedValue({
        id: 'coupon-fs',
        code: 'FREESHIP',
        isActive: true,
        startsAt: new Date(Date.now() - 10000),
        expiresAt: new Date(Date.now() + 100000),
        totalUsageLimit: 100,
        currentUsageCount: 0,
        minOrderAmount: 0,
        discountType: DiscountType.FREE_SHIPPING,
        discountValue: 0,
      });

      const result = await service.validateCoupon({
        code: 'FREESHIP',
        orderAmount: 650,
      });

      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(50);
    });

    it('rejects a free shipping coupon with ALREADY_FREE_SHIPPING when order qualifies for free shipping', async () => {
      prismaMock.promotionCoupon.findUnique.mockResolvedValue({
        id: 'coupon-fs',
        code: 'FREESHIP',
        isActive: true,
        startsAt: new Date(Date.now() - 10000),
        expiresAt: new Date(Date.now() + 100000),
        totalUsageLimit: 100,
        currentUsageCount: 0,
        minOrderAmount: 0,
        discountType: DiscountType.FREE_SHIPPING,
        discountValue: 0,
      });

      const result = await service.validateCoupon({
        code: 'FREESHIP',
        orderAmount: 1500,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('ALREADY_FREE_SHIPPING');
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
      expect(calculation.items[0]?.netPrice).toBe(
        1000 - calculation.items[0]!.discountShare,
      );
      expect(calculation.items[1]?.netPrice).toBe(
        1700 - calculation.items[1]!.discountShare,
      );
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

  describe('Audit Logging', () => {
    it('records audit log when coupon is created', async () => {
      const auditLogMock = { recordLog: vi.fn().mockResolvedValue(null) };
      const serviceWithAudit = new CouponsService(
        prismaMock as unknown as PrismaService,
        auditLogMock as any,
      );

      prismaMock.promotionCoupon.findUnique.mockResolvedValue(null);
      prismaMock.promotionCoupon.create.mockResolvedValue({
        id: 'cp-new-1',
        code: 'SAVE10',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        minOrderAmount: 100,
        maxDiscountAmount: 50,
        totalUsageLimit: 100,
        userUsageLimit: 1,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
        isActive: true,
      });

      await serviceWithAudit.createCoupon(
        {
          code: 'SAVE10',
          discountType: DiscountType.PERCENTAGE,
          discountValue: 10,
          minOrderAmount: 100,
          maxDiscountAmount: 50,
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        },
        'admin-audit-id',
      );

      expect(auditLogMock.recordLog).toHaveBeenCalledWith(
        expect.objectContaining({
          adminId: 'admin-audit-id',
          actionType: 'CREATE',
          targetTable: 'coupons',
          targetId: 'cp-new-1',
        }),
      );
    });

    it('records audit log when coupon is toggled', async () => {
      const auditLogMock = { recordLog: vi.fn().mockResolvedValue(null) };
      const serviceWithAudit = new CouponsService(
        prismaMock as unknown as PrismaService,
        auditLogMock as any,
      );

      prismaMock.promotionCoupon.findFirst.mockResolvedValue({
        id: 'cp-toggle-1',
        code: 'SAVE10',
        isActive: true,
      });
      prismaMock.promotionCoupon.update.mockResolvedValue({
        id: 'cp-toggle-1',
        code: 'SAVE10',
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 50,
        minOrderAmount: 0,
        maxDiscountAmount: null,
        totalUsageLimit: 10,
        userUsageLimit: 1,
        startsAt: new Date(),
        expiresAt: new Date(),
        isActive: false,
      });

      await serviceWithAudit.toggleCoupon('cp-toggle-1', 'admin-audit-id');

      expect(auditLogMock.recordLog).toHaveBeenCalledWith(
        expect.objectContaining({
          adminId: 'admin-audit-id',
          actionType: 'STATUS_CHANGE',
          targetTable: 'coupons',
          targetId: 'cp-toggle-1',
          oldValuesJson: { code: 'SAVE10', isActive: true },
          newValuesJson: { code: 'SAVE10', isActive: false },
        }),
      );
    });
  });
});
