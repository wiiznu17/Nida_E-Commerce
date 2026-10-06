import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrdersService } from './orders.service.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentMethod, OrderStatus, ShipmentStatus } from '@repo/types';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaMock: any;
  let couponsServiceMock: any;

  beforeEach(() => {
    prismaMock = {
      productVariant: {
        findMany: vi.fn(),
      },
      order: {
        create: vi.fn(),
        findUnique: vi.fn(),
      },
      orderItem: {
        create: vi.fn(),
      },
      inventoryItem: {
        update: vi.fn(),
        updateMany: vi.fn(),
        findUnique: vi.fn(),
      },
      stockMovement: {
        create: vi.fn(),
      },
      promotionCoupon: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      couponRedemption: {
        create: vi.fn(),
      },
      payment: {
        create: vi.fn(),
      },
      shipment: {
        findFirst: vi.fn(),
      },
      $transaction: vi.fn(async (callback) => callback(prismaMock)),
    };

    couponsServiceMock = {
      calculateCheckout: vi.fn(),
    };

    service = new OrdersService(prismaMock, couponsServiceMock);
  });

  describe('createOrder', () => {
    const baseDto = {
      items: [{ variantId: 'variant-1', quantity: 2 }],
      shippingAddress: {
        recipientName: 'Somchai Jaidee',
        phone: '0812345678',
        addressLine1: '123 Sukhumvit',
        subdistrict: 'Khlong Toei',
        district: 'Khlong Toei',
        province: 'Bangkok',
        postalCode: '10110',
      },
      paymentMethod: PaymentMethod.PROMPTPAY,
    };

    it('throws BadRequestException if stock is insufficient before checkout', async () => {
      couponsServiceMock.calculateCheckout.mockResolvedValue({
        items: [{ variantId: 'variant-1', quantity: 5, unitPrice: 1000, subtotal: 5000, discountShare: 0, netPrice: 5000, productName: 'Shirt', variantInfo: 'White / M' }],
        subtotal: 5000,
        discountTotal: 0,
        shippingFee: 0,
        taxAmount: 327,
        totalAmount: 5000,
      });

      prismaMock.productVariant.findMany.mockResolvedValue([
        {
          id: 'variant-1',
          product: { name: 'Shirt', isPreorder: false, images: [] },
          colorName: 'White',
          size: 'M',
          inventoryItem: { id: 'inv-1', quantityAvailable: 2 },
        },
      ]);

      await expect(
        service.createOrder({
          ...baseDto,
          items: [{ variantId: 'variant-1', quantity: 5 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if atomic stock update fails during concurrent checkout', async () => {
      couponsServiceMock.calculateCheckout.mockResolvedValue({
        items: [{ variantId: 'variant-1', quantity: 2, unitPrice: 1000, subtotal: 2000, discountShare: 0, netPrice: 2000, productName: 'Shirt', variantInfo: 'White / M' }],
        subtotal: 2000,
        discountTotal: 0,
        shippingFee: 0,
        taxAmount: 130,
        totalAmount: 2000,
      });

      prismaMock.productVariant.findMany.mockResolvedValue([
        {
          id: 'variant-1',
          product: { name: 'Shirt', isPreorder: false, images: [] },
          colorName: 'White',
          size: 'M',
          inventoryItem: { id: 'inv-1', quantityAvailable: 2 },
        },
      ]);

      prismaMock.order.create.mockResolvedValue({ id: 'order-1', orderNumber: 'NIDA-TEST' });
      // Simulate race condition: updateMany returns count 0 (another user grabbed the last stock)
      prismaMock.inventoryItem.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.createOrder(baseDto)).rejects.toThrow(BadRequestException);
    });

    it('successfully processes pre-order items without decrementing available stock', async () => {
      couponsServiceMock.calculateCheckout.mockResolvedValue({
        items: [{ variantId: 'variant-preorder', quantity: 1, unitPrice: 3500, subtotal: 3500, discountShare: 0, netPrice: 3500, productName: 'Cashmere Knit', variantInfo: 'Camel / S' }],
        subtotal: 3500,
        discountTotal: 0,
        shippingFee: 0,
        taxAmount: 228,
        totalAmount: 3500,
      });

      prismaMock.productVariant.findMany.mockResolvedValue([
        {
          id: 'variant-preorder',
          product: { name: 'Cashmere Knit', isPreorder: true, preorderReleaseDate: new Date('2026-11-01'), images: [] },
          colorName: 'Camel',
          size: 'S',
          inventoryItem: { id: 'inv-preorder', quantityAvailable: 0, preorderBooked: 0 },
        },
      ]);

      prismaMock.order.create.mockResolvedValue({ id: 'order-pre', orderNumber: 'NIDA-PRE-01' });

      // Mock getOrderByNumber response
      vi.spyOn(service, 'getOrderByNumber').mockResolvedValue({
        id: 'order-pre',
        orderNumber: 'NIDA-PRE-01',
        status: OrderStatus.PENDING,
        hasPreorderItems: true,
        subtotal: 3500,
        discountTotal: 0,
        shippingFee: 0,
        taxAmount: 228,
        totalAmount: 3500,
        currency: 'THB',
        items: [],
        shippingAddress: baseDto.shippingAddress,
        shipments: [],
        placedAt: new Date().toISOString(),
      });

      const order = await service.createOrder({
        ...baseDto,
        items: [{ variantId: 'variant-preorder', quantity: 1 }],
      });

      expect(prismaMock.inventoryItem.updateMany).not.toHaveBeenCalled();
      expect(prismaMock.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: 'inv-preorder' },
        data: { preorderBooked: { increment: 1 } },
      });
      expect(order.orderNumber).toBe('NIDA-PRE-01');
    });

    it('applies coupon, records redemption, and decrements stock atomically for normal items', async () => {
      couponsServiceMock.calculateCheckout.mockResolvedValue({
        items: [{ variantId: 'variant-1', quantity: 2, unitPrice: 1000, subtotal: 2000, discountShare: 200, netPrice: 1800, productName: 'Shirt', variantInfo: 'White / M' }],
        subtotal: 2000,
        discountTotal: 200,
        shippingFee: 0,
        taxAmount: 117,
        totalAmount: 1800,
        couponApplied: {
          code: 'WELCOME10',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          discountAmount: 200,
        },
      });

      prismaMock.productVariant.findMany.mockResolvedValue([
        {
          id: 'variant-1',
          product: { name: 'Shirt', isPreorder: false, images: [] },
          colorName: 'White',
          size: 'M',
          inventoryItem: { id: 'inv-1', quantityAvailable: 10 },
        },
      ]);

      prismaMock.promotionCoupon.findUnique.mockResolvedValue({
        id: 'coupon-1',
        code: 'WELCOME10',
        currentUsageCount: 5,
        totalUsageLimit: 100,
      });

      prismaMock.order.create.mockResolvedValue({ id: 'order-1', orderNumber: 'NIDA-ORD-01' });
      prismaMock.inventoryItem.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.inventoryItem.findUnique.mockResolvedValue({ quantityAvailable: 8 });

      vi.spyOn(service, 'getOrderByNumber').mockResolvedValue({
        id: 'order-1',
        orderNumber: 'NIDA-ORD-01',
        status: OrderStatus.PENDING,
        hasPreorderItems: false,
        subtotal: 2000,
        discountTotal: 200,
        shippingFee: 0,
        taxAmount: 117,
        totalAmount: 1800,
        currency: 'THB',
        promoCodeUsed: 'WELCOME10',
        items: [],
        shippingAddress: baseDto.shippingAddress,
        shipments: [],
        placedAt: new Date().toISOString(),
      });

      const order = await service.createOrder({
        ...baseDto,
        couponCode: 'WELCOME10',
      });

      expect(prismaMock.inventoryItem.updateMany).toHaveBeenCalledWith({
        where: { id: 'inv-1', quantityAvailable: { gte: 2 } },
        data: { quantityAvailable: { decrement: 2 } },
      });
      expect(prismaMock.couponRedemption.create).toHaveBeenCalled();
      expect(prismaMock.promotionCoupon.update).toHaveBeenCalledWith({
        where: { id: 'coupon-1' },
        data: { currentUsageCount: { increment: 1 } },
      });
      expect(order.promoCodeUsed).toBe('WELCOME10');
    });
  });

  describe('getOrderByNumber', () => {
    it('throws NotFoundException if order does not exist', async () => {
      prismaMock.order.findUnique.mockResolvedValue(null);

      await expect(service.getOrderByNumber('NONEXISTENT')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns formatted order when found', async () => {
      prismaMock.order.findUnique.mockResolvedValue({
        id: 'ord-123',
        orderNumber: 'NIDA-20261006-ABCD',
        status: OrderStatus.PENDING,
        hasPreorderItems: false,
        subtotal: 1000,
        discountTotal: 0,
        shippingFee: 50,
        taxAmount: 68,
        totalAmount: 1050,
        currency: 'THB',
        shippingAddressSnapshot: {
          recipientName: 'Test Recipient',
          phone: '0812345678',
          addressLine1: '123 Road',
          subdistrict: 'Sub',
          district: 'Dist',
          province: 'BKK',
          postalCode: '10110',
        },
        items: [],
        shipments: [],
        payment: null,
        placedAt: new Date(),
      });

      const order = await service.getOrderByNumber('NIDA-20261006-ABCD');

      expect(order.orderNumber).toBe('NIDA-20261006-ABCD');
      expect(order.totalAmount).toBe(1050);
    });
  });

  describe('trackShipment', () => {
    it('throws NotFoundException if shipment or order reference is not found', async () => {
      prismaMock.shipment.findFirst.mockResolvedValue(null);

      await expect(service.trackShipment('UNKNOWN-TRACK')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns tracking details and timeline when shipment exists', async () => {
      prismaMock.shipment.findFirst.mockResolvedValue({
        id: 'ship-1',
        courierName: 'Flash Express',
        trackingNumber: 'TH888999',
        status: ShipmentStatus.IN_TRANSIT,
        shippedAt: new Date(),
        estimatedDelivery: null,
        deliveredAt: null,
        logs: [
          {
            id: 'log-1',
            statusTitle: 'In transit',
            statusDescription: 'Package arrived at sorting hub',
            location: 'Bangkok Sorting Center',
            logTimestamp: new Date(),
          },
        ],
        order: {
          orderNumber: 'NIDA-ORDER-1',
          status: OrderStatus.SHIPPED,
        },
      });

      const result = await service.trackShipment('TH888999');

      expect(result.orderNumber).toBe('NIDA-ORDER-1');
      expect(result.shipment.trackingNumber).toBe('TH888999');
      expect(result.shipment.timeline).toHaveLength(1);
    });
  });
});
