import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrdersService } from '../../src/modules/orders/orders.service.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  PaymentMethod,
  OrderStatus,
  ShipmentStatus,
  PaymentStatus,
} from '@repo/types';

import { CarrierMockService } from '../../src/modules/orders/carrier/index.js';
import {
  LogisticsService,
  InternalLogisticsProvider,
  ShippopLogisticsProvider,
} from '../../src/modules/orders/logistics/index.js';
import type { OrderLifecycleProducerService } from '../../src/modules/order-lifecycle/order-lifecycle-producer.service.js';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaMock: any;
  let couponsServiceMock: any;
  let carrierMockService: CarrierMockService;
  let paymentGatewayServiceMock: any;
  let logisticsService: LogisticsService;
  let orderLifecycleProducerMock: any;

  beforeEach(() => {
    prismaMock = {
      productVariant: {
        findMany: vi.fn(),
      },
      order: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      orderItem: {
        create: vi.fn(),
        findMany: vi.fn(),
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
        deleteMany: vi.fn(),
      },
      payment: {
        create: vi.fn(),
        update: vi.fn(),
      },
      shipment: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      refund: {
        create: vi.fn(),
        count: vi.fn().mockResolvedValue(0),
      },
      orderCancellationRequest: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      returnRequest: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      pointTransaction: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (callback) => callback(prismaMock)),
    };

    couponsServiceMock = {
      calculateCheckout: vi.fn(),
    };

    carrierMockService = new CarrierMockService();
    const internalProvider = new InternalLogisticsProvider(carrierMockService);
    const shippopProvider = new ShippopLogisticsProvider();
    logisticsService = new LogisticsService(
      internalProvider,
      shippopProvider,
      prismaMock,
    );

    paymentGatewayServiceMock = {
      createRefund: vi.fn().mockResolvedValue({
        gatewayRefundId: 'rfnd_test_mock_123',
        status: 'SUCCEEDED',
      }),
    };

    orderLifecycleProducerMock = {
      scheduleOrderTimeout: vi.fn().mockResolvedValue('job-123'),
      cancelOrderTimeout: vi.fn().mockResolvedValue(true),
      scheduleCancellationReviewTimeout: vi.fn().mockResolvedValue('job-456'),
      cancelCancellationReviewTimeout: vi.fn().mockResolvedValue(true),
      scheduleDeliveryCompletion: vi.fn().mockResolvedValue('job-789'),
      cancelDeliveryCompletion: vi.fn().mockResolvedValue(true),
      scheduleReturnDeadline: vi.fn().mockResolvedValue('job-101'),
      cancelReturnDeadline: vi.fn().mockResolvedValue(true),
    };

    service = new OrdersService(
      prismaMock,
      couponsServiceMock,
      carrierMockService,
      logisticsService,
      paymentGatewayServiceMock,
      orderLifecycleProducerMock as unknown as OrderLifecycleProducerService,
    );
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
        items: [
          {
            variantId: 'variant-1',
            quantity: 5,
            unitPrice: 1000,
            subtotal: 5000,
            discountShare: 0,
            netPrice: 5000,
            productName: 'Shirt',
            variantInfo: 'White / M',
          },
        ],
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
        items: [
          {
            variantId: 'variant-1',
            quantity: 2,
            unitPrice: 1000,
            subtotal: 2000,
            discountShare: 0,
            netPrice: 2000,
            productName: 'Shirt',
            variantInfo: 'White / M',
          },
        ],
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

      prismaMock.order.create.mockResolvedValue({
        id: 'order-1',
        orderNumber: 'NIDA-TEST',
      });
      // Simulate race condition: updateMany returns count 0 (another user grabbed the last stock)
      prismaMock.inventoryItem.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.createOrder(baseDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('successfully processes pre-order items without decrementing available stock', async () => {
      couponsServiceMock.calculateCheckout.mockResolvedValue({
        items: [
          {
            variantId: 'variant-preorder',
            quantity: 1,
            unitPrice: 3500,
            subtotal: 3500,
            discountShare: 0,
            netPrice: 3500,
            productName: 'Cashmere Knit',
            variantInfo: 'Camel / S',
          },
        ],
        subtotal: 3500,
        discountTotal: 0,
        shippingFee: 0,
        taxAmount: 228,
        totalAmount: 3500,
      });

      prismaMock.productVariant.findMany.mockResolvedValue([
        {
          id: 'variant-preorder',
          product: {
            name: 'Cashmere Knit',
            isPreorder: true,
            preorderReleaseDate: new Date('2026-11-01'),
            images: [],
          },
          colorName: 'Camel',
          size: 'S',
          inventoryItem: {
            id: 'inv-preorder',
            quantityAvailable: 0,
            preorderBooked: 0,
          },
        },
      ]);

      prismaMock.order.create.mockResolvedValue({
        id: 'order-pre',
        orderNumber: 'NIDA-PRE-01',
      });

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
        items: [
          {
            variantId: 'variant-1',
            quantity: 2,
            unitPrice: 1000,
            subtotal: 2000,
            discountShare: 200,
            netPrice: 1800,
            productName: 'Shirt',
            variantInfo: 'White / M',
          },
        ],
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

      prismaMock.order.create.mockResolvedValue({
        id: 'order-1',
        orderNumber: 'NIDA-ORD-01',
      });
      prismaMock.inventoryItem.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.inventoryItem.findUnique.mockResolvedValue({
        quantityAvailable: 8,
      });

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

  describe('fulfillWithCarrier', () => {
    it('throws NotFoundException if order does not exist', async () => {
      prismaMock.order.findFirst.mockResolvedValue(null);

      await expect(
        service.fulfillWithCarrier('NON_EXISTING', 'FLASH_EXPRESS'),
      ).rejects.toThrow(NotFoundException);
    });

    it('books consignment, creates shipment and updates order to SHIPPED', async () => {
      const mockOrder = {
        id: 'order-123',
        orderNumber: 'NIDA-20261014-ABC1',
        status: OrderStatus.PROCESSING,
        currency: 'THB',
        placedAt: new Date(),
        items: [],
        shippingAddressSnapshot: {
          recipientName: 'Test Recipient',
          phone: '0812345678',
        },
        payment: null,
        shipments: [],
      };

      prismaMock.order.findFirst.mockResolvedValue(mockOrder);
      prismaMock.shipment.create.mockResolvedValue({
        id: 'ship-new',
        orderId: mockOrder.id,
        courierName: 'Flash Express',
        trackingNumber: 'TH1234567890A',
        status: ShipmentStatus.LABEL_CREATED,
        logs: [],
      });
      prismaMock.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.SHIPPED,
        shipments: [
          {
            id: 'ship-new',
            courierName: 'Flash Express',
            trackingNumber: 'TH1234567890A',
            status: ShipmentStatus.LABEL_CREATED,
            logs: [],
          },
        ],
      });

      const result = await service.fulfillWithCarrier(
        mockOrder.id,
        'FLASH_EXPRESS',
      );

      expect(prismaMock.shipment.create).toHaveBeenCalled();
      expect(prismaMock.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockOrder.id },
          data: { status: OrderStatus.SHIPPED },
        }),
      );
      expect(result.status).toBe(OrderStatus.SHIPPED);
      expect(result.shipments[0]?.courierName).toBe('Flash Express');
    });
  });

  describe('updateOrderStatus', () => {
    it('throws BadRequestException if transition skips steps (e.g. PAID to DELIVERED)', async () => {
      const mockOrder = {
        id: 'ord-step-1',
        orderNumber: 'NIDA-STEP-01',
        status: OrderStatus.PAID,
        shipments: [],
      };

      prismaMock.order.findFirst.mockResolvedValue(mockOrder);

      await expect(
        service.updateOrderStatus(mockOrder.id, OrderStatus.DELIVERED),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if transitioning to SHIPPED without tracking number', async () => {
      const mockOrder = {
        id: 'ord-step-2',
        orderNumber: 'NIDA-STEP-02',
        status: OrderStatus.PROCESSING,
        shipments: [],
      };

      prismaMock.order.findFirst.mockResolvedValue(mockOrder);

      await expect(
        service.updateOrderStatus(mockOrder.id, OrderStatus.SHIPPED),
      ).rejects.toThrow(BadRequestException);
    });

    it('successfully transitions from PROCESSING to SHIPPED when tracking number is provided', async () => {
      const mockOrder = {
        id: 'ord-step-3',
        orderNumber: 'NIDA-STEP-03',
        status: OrderStatus.PROCESSING,
        currency: 'THB',
        placedAt: new Date(),
        items: [],
        shippingAddressSnapshot: {
          recipientName: 'Recipient 3',
          phone: '0899999999',
        },
        payment: null,
        shipments: [],
      };

      prismaMock.order.findFirst.mockResolvedValue(mockOrder);
      prismaMock.shipment.create.mockResolvedValue({
        id: 'ship-3',
        orderId: mockOrder.id,
        courierName: 'Kerry Express TH',
        trackingNumber: 'KER-123456TH',
        status: ShipmentStatus.LABEL_CREATED,
        logs: [],
      });
      prismaMock.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.SHIPPED,
        shipments: [
          {
            id: 'ship-3',
            courierName: 'Kerry Express TH',
            trackingNumber: 'KER-123456TH',
            status: ShipmentStatus.LABEL_CREATED,
            logs: [],
          },
        ],
      });

      const result = await service.updateOrderStatus(
        mockOrder.id,
        OrderStatus.SHIPPED,
        'Kerry Express TH',
        'KER-123456TH',
      );

      expect(prismaMock.shipment.create).toHaveBeenCalled();
      expect(result.status).toBe(OrderStatus.SHIPPED);
      expect(result.shipments[0]?.trackingNumber).toBe('KER-123456TH');
    });

    it('should synchronize payment status to PAID with transaction reference on emergency override', async () => {
      const pendingOrder = {
        id: 'ord-pending-1',
        orderNumber: 'NIDA-PENDING-01',
        status: OrderStatus.PENDING,
        currency: 'THB',
        placedAt: new Date(),
        items: [],
        shippingAddressSnapshot: {
          recipientName: 'Recipient Pending',
          phone: '0891111111',
        },
        payment: {
          id: 'pay-1',
          orderId: 'ord-pending-1',
          status: 'PENDING',
          amount: 1590,
          currency: 'THB',
        },
        shipments: [],
      };

      prismaMock.order.findFirst.mockResolvedValue(pendingOrder);
      prismaMock.payment.update.mockResolvedValue({
        ...pendingOrder.payment,
        status: 'PAID',
        paidAt: new Date(),
        transactionReference: 'chrg_test_manual_123',
      });
      prismaMock.order.update.mockResolvedValue({
        ...pendingOrder,
        status: OrderStatus.PAID,
        payment: {
          ...pendingOrder.payment,
          status: 'PAID',
          transactionReference: 'chrg_test_manual_123',
        },
      });

      const result = await service.updateOrderStatus(
        pendingOrder.id,
        OrderStatus.PAID,
        undefined,
        undefined,
        'chrg_test_manual_123',
        'Omise Webhook timeout',
      );

      expect(prismaMock.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'pay-1' },
          data: expect.objectContaining({
            status: PaymentStatus.CAPTURED,
            transactionReference: 'chrg_test_manual_123',
          }),
        }),
      );
      expect(result.status).toBe(OrderStatus.PAID);
    });

    it('restocks inventory and rolls back coupon when status is updated to CANCELLED', async () => {
      const orderWithCoupon = {
        id: 'ord-cancel-1',
        orderNumber: 'NIDA-CANCEL-01',
        status: OrderStatus.PENDING,
        currency: 'THB',
        couponId: 'coup-1',
        placedAt: new Date(),
        items: [
          {
            id: 'item-1',
            variantId: 'var-1',
            quantity: 2,
          },
        ],
        shippingAddressSnapshot: {},
        payment: null,
        shipments: [],
      };

      prismaMock.order.findFirst.mockResolvedValue(orderWithCoupon);
      prismaMock.orderItem.findMany.mockResolvedValue(orderWithCoupon.items);
      prismaMock.order.update.mockResolvedValue({
        ...orderWithCoupon,
        status: OrderStatus.CANCELLED,
      });

      const res = await service.updateOrderStatus(
        orderWithCoupon.id,
        OrderStatus.CANCELLED,
      );

      expect(res.status).toBe(OrderStatus.CANCELLED);
      expect(prismaMock.couponRedemption.deleteMany).toHaveBeenCalledWith({
        where: { orderId: orderWithCoupon.id },
      });
      expect(prismaMock.promotionCoupon.update).toHaveBeenCalledWith({
        where: { id: 'coup-1' },
        data: { currentUsageCount: { decrement: 1 } },
      });
    });
  });

  describe('processRefund', () => {
    const mockOrder = {
      id: 'ord-123',
      orderNumber: 'NIDA-20261017-001',
      status: OrderStatus.PAID,
      currency: 'THB',
      userId: 'user-1',
      subtotal: 1000,
      discountTotal: 0,
      shippingFee: 50,
      taxAmount: 70,
      totalAmount: 1050,
      hasPreorderItems: false,
      placedAt: new Date(),
      items: [
        {
          id: 'item-1',
          productNameSnapshot: 'Silk Shirt',
          variantInfoSnapshot: 'Black / M',
          quantity: 1,
          unitPrice: 1000,
          subtotal: 1000,
          discountShare: 0,
          netPrice: 1000,
          isPreorder: false,
          variant: {
            id: 'var-1',
            inventoryItem: {
              id: 'inv-1',
              quantityAvailable: 10,
              preorderBooked: 0,
            },
          },
        },
      ],
      shippingAddressSnapshot: {
        recipientName: 'Customer Test',
        phone: '0812345678',
      },
      payment: {
        id: 'pay-123',
        amount: 1050,
        status: PaymentStatus.CAPTURED,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        transactionReference: 'chrg_test_omise_123',
      },
      refunds: [] as any[],
      pointTransactions: [
        {
          id: 'pt-1',
          changeType: 'EARNED_ORDER',
          pointsChange: 10,
        },
      ],
      shipments: [],
      cancellationRequests: [],
      returnRequests: [],
    };

    it('throws NotFoundException if order is not found', async () => {
      prismaMock.order.findFirst.mockResolvedValue(null);

      await expect(
        service.processRefund('non-existent', { reason: 'Wrong size' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if order has no payment', async () => {
      prismaMock.order.findFirst.mockResolvedValue({
        ...mockOrder,
        payment: null,
      });

      await expect(
        service.processRefund(mockOrder.id, {
          reason: 'Customer change of mind',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if order is already fully refunded', async () => {
      prismaMock.order.findFirst.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.REFUNDED,
        payment: { ...mockOrder.payment, status: PaymentStatus.REFUNDED },
      });

      await expect(
        service.processRefund(mockOrder.id, { reason: 'Double refund' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('successfully processes full refund, calls payment gateway, restocks inventory, and reverses points', async () => {
      prismaMock.order.findFirst.mockResolvedValue(mockOrder);
      prismaMock.order.findUnique.mockResolvedValue(mockOrder);
      prismaMock.refund.count.mockResolvedValue(0);
      prismaMock.refund.create.mockResolvedValue({ id: 'rf-1' });
      prismaMock.inventoryItem.update.mockResolvedValue({
        id: 'inv-1',
        quantityAvailable: 11,
      });
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        points: 50,
      });

      const result = await service.processRefund(
        mockOrder.id,
        { reason: 'Customer cancellation', restockInventory: true },
        'admin-001',
      );

      expect(paymentGatewayServiceMock.createRefund).toHaveBeenCalledWith({
        transactionReference: 'chrg_test_omise_123',
        amount: 1050,
        reason: 'Customer cancellation',
      });
      expect(prismaMock.refund.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orderId: mockOrder.id,
            amount: 1050,
            status: 'SUCCEEDED',
            gatewayRefundId: 'rfnd_test_mock_123',
            createdAdminId: 'admin-001',
          }),
        }),
      );
      expect(prismaMock.payment.update).toHaveBeenCalledWith({
        where: { id: 'pay-123' },
        data: { status: PaymentStatus.REFUNDED },
      });
      expect(prismaMock.order.update).toHaveBeenCalledWith({
        where: { id: mockOrder.id },
        data: { status: OrderStatus.REFUNDED },
      });
      expect(prismaMock.stockMovement.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            variantId: 'var-1',
            quantityChange: 1,
            adminId: 'admin-001',
          }),
        }),
      );
      expect(prismaMock.pointTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            changeType: 'REFUND_CANCEL',
            pointsChange: -10,
          }),
        }),
      );
      expect(result.id).toBe(mockOrder.id);
    });

    it('handles partial refund without marking order as REFUNDED', async () => {
      prismaMock.order.findFirst.mockResolvedValue(mockOrder);
      prismaMock.order.findUnique.mockResolvedValue(mockOrder);
      prismaMock.refund.count.mockResolvedValue(0);

      await service.processRefund(
        mockOrder.id,
        { amount: 500, reason: 'Partial Goodwill', restockInventory: false },
        'admin-001',
      );

      expect(paymentGatewayServiceMock.createRefund).toHaveBeenCalledWith({
        transactionReference: 'chrg_test_omise_123',
        amount: 500,
        reason: 'Partial Goodwill',
      });
      expect(prismaMock.payment.update).not.toHaveBeenCalled();
      expect(prismaMock.order.update).not.toHaveBeenCalled();
      expect(prismaMock.stockMovement.create).not.toHaveBeenCalled();
    });
  });

  describe('reviewCancellationRequest', () => {
    const mockRequest = {
      id: 'req-1',
      requestNumber: 'CAN-001',
      orderId: 'ord-123',
      userId: 'user-1',
      reason: 'Change address',
      status: 'PENDING',
      order: {
        id: 'ord-123',
        orderNumber: 'NIDA-20261017-001',
        status: OrderStatus.PAID,
        payment: {
          id: 'pay-123',
          amount: 1050,
          transactionReference: 'chrg_123',
        },
      },
    };

    it('throws NotFoundException if cancellation request is not found', async () => {
      prismaMock.orderCancellationRequest.findUnique.mockResolvedValue(null);

      await expect(
        service.reviewCancellationRequest('non-existent', { action: 'REJECT' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if cancellation request is already reviewed', async () => {
      prismaMock.orderCancellationRequest.findUnique.mockResolvedValue({
        ...mockRequest,
        status: 'APPROVED',
      });

      await expect(
        service.reviewCancellationRequest(mockRequest.id, { action: 'REJECT' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('successfully rejects cancellation request', async () => {
      prismaMock.orderCancellationRequest.findUnique.mockResolvedValue(
        mockRequest,
      );

      const res = await service.reviewCancellationRequest(
        mockRequest.id,
        { action: 'REJECT', adminNote: 'Order already prepared' },
        'admin-001',
      );

      expect(prismaMock.orderCancellationRequest.update).toHaveBeenCalledWith({
        where: { id: mockRequest.id },
        data: expect.objectContaining({
          status: 'REJECTED',
          adminNote: 'Order already prepared',
          reviewedBy: 'admin-001',
        }),
      });
      expect(res.success).toBe(true);
    });

    it('successfully approves cancellation request and triggers refund', async () => {
      prismaMock.orderCancellationRequest.findUnique.mockResolvedValue(
        mockRequest,
      );
      const processRefundSpy = vi
        .spyOn(service, 'processRefund')
        .mockResolvedValue({} as any);

      const res = await service.reviewCancellationRequest(
        mockRequest.id,
        { action: 'APPROVE', adminNote: 'Approved by admin' },
        'admin-001',
      );

      expect(prismaMock.orderCancellationRequest.update).toHaveBeenCalledWith({
        where: { id: mockRequest.id },
        data: expect.objectContaining({
          status: 'APPROVED',
          adminNote: 'Approved by admin',
          reviewedBy: 'admin-001',
        }),
      });
      expect(processRefundSpy).toHaveBeenCalledWith(
        mockRequest.orderId,
        expect.objectContaining({
          reason: 'อนุมัติคำขอยกเลิก: Change address',
          restockInventory: true,
        }),
        'admin-001',
      );
      expect(res.success).toBe(true);
    });
  });

  describe('reviewReturnRequest', () => {
    const mockReturn = {
      id: 'ret-1',
      requestNumber: 'RET-001',
      orderId: 'ord-123',
      userId: 'user-1',
      reason: 'Defective item',
      status: 'PENDING',
      order: {
        id: 'ord-123',
        orderNumber: 'NIDA-20261017-001',
        payment: { id: 'pay-123', amount: 1050 },
      },
    };

    it('throws NotFoundException if return request is not found', async () => {
      prismaMock.returnRequest.findUnique.mockResolvedValue(null);

      await expect(
        service.reviewReturnRequest('non-existent', { action: 'REJECT' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if return request is already completed or rejected', async () => {
      prismaMock.returnRequest.findUnique.mockResolvedValue({
        ...mockReturn,
        status: 'COMPLETED',
      });

      await expect(
        service.reviewReturnRequest(mockReturn.id, { action: 'APPROVE' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('successfully rejects return request', async () => {
      prismaMock.returnRequest.findUnique.mockResolvedValue(mockReturn);

      const res = await service.reviewReturnRequest(
        mockReturn.id,
        { action: 'REJECT', adminNote: 'Item shows signs of wear' },
        'admin-001',
      );

      expect(prismaMock.returnRequest.update).toHaveBeenCalledWith({
        where: { id: mockReturn.id },
        data: expect.objectContaining({
          status: 'REJECTED',
          adminNote: 'Item shows signs of wear',
          reviewedBy: 'admin-001',
        }),
      });
      expect(res.success).toBe(true);
    });

    it('successfully approves return request for item return', async () => {
      prismaMock.returnRequest.findUnique.mockResolvedValue(mockReturn);

      const res = await service.reviewReturnRequest(
        mockReturn.id,
        { action: 'APPROVE', adminNote: 'Please return within 7 days' },
        'admin-001',
      );

      expect(prismaMock.returnRequest.update).toHaveBeenCalledWith({
        where: { id: mockReturn.id },
        data: expect.objectContaining({
          status: 'APPROVED',
          adminNote: 'Please return within 7 days',
          reviewedBy: 'admin-001',
        }),
      });
      expect(res.success).toBe(true);
    });

    it('throws BadRequestException if attempting COMPLETE when return tracking has not been submitted', async () => {
      prismaMock.returnRequest.findUnique.mockResolvedValue({
        ...mockReturn,
        status: 'APPROVED',
        returnTrackingNumber: null,
      });

      await expect(
        service.reviewReturnRequest(
          mockReturn.id,
          { action: 'COMPLETE', adminNote: 'Premature inspect' },
          'admin-001',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('completes return and executes refund on COMPLETE', async () => {
      prismaMock.returnRequest.findUnique.mockResolvedValue({
        ...mockReturn,
        status: 'SHIPPED',
        returnTrackingNumber: 'TH123456789',
        returnCarrier: 'Flash Express',
      });
      const processRefundSpy = vi
        .spyOn(service, 'processRefund')
        .mockResolvedValue({} as any);

      const res = await service.reviewReturnRequest(
        mockReturn.id,
        {
          action: 'COMPLETE',
          adminNote: 'Item verified intact',
          refundAmount: 1000,
        },
        'admin-001',
      );

      expect(prismaMock.returnRequest.update).toHaveBeenCalledWith({
        where: { id: mockReturn.id },
        data: expect.objectContaining({
          status: 'COMPLETED',
          adminNote: 'Item verified intact',
          reviewedBy: 'admin-001',
        }),
      });
      expect(processRefundSpy).toHaveBeenCalledWith(
        mockReturn.orderId,
        expect.objectContaining({
          amount: 1000,
          reason: 'ตรวจรับสินค้าคืน: Defective item',
          restockInventory: true,
        }),
        'admin-001',
      );
      expect(res.success).toBe(true);
    });
  });

  describe('Audit Logging', () => {
    it('records audit log when order status is updated', async () => {
      const auditLogMock = { recordLog: vi.fn().mockResolvedValue(null) };
      const serviceWithAudit = new OrdersService(
        prismaMock,
        couponsServiceMock,
        carrierMockService,
        logisticsService,
        paymentGatewayServiceMock,
        orderLifecycleProducerMock as unknown as OrderLifecycleProducerService,
        auditLogMock as any,
      );

      const existingOrder = {
        id: 'ord-audit-1',
        orderNumber: 'NIDA-2026-0001',
        status: OrderStatus.PROCESSING,
        totalAmount: 1500,
        currency: 'THB',
        items: [],
        shipments: [{ trackingNumber: 'TRACK123' }],
        shippingAddressSnapshot: {
          recipientName: 'Somchai Jaidee',
          phone: '0812345678',
          addressLine1: '123 Sukhumvit Road',
        },
      };

      prismaMock.order.findFirst.mockResolvedValue(existingOrder);
      prismaMock.order.update.mockResolvedValue({
        ...existingOrder,
        status: OrderStatus.SHIPPED,
      });

      await serviceWithAudit.updateOrderStatus(
        'ord-audit-1',
        OrderStatus.SHIPPED,
        'Kerry Express',
        'TRACK123',
        undefined,
        'Shipped by warehouse',
        'admin-audit-id',
      );

      expect(auditLogMock.recordLog).toHaveBeenCalledWith(
        expect.objectContaining({
          adminId: 'admin-audit-id',
          actionType: 'STATUS_CHANGE',
          targetTable: 'orders',
          targetId: 'ord-audit-1',
          oldValuesJson: {
            orderNumber: 'NIDA-2026-0001',
            status: OrderStatus.PROCESSING,
          },
          newValuesJson: expect.objectContaining({
            orderNumber: 'NIDA-2026-0001',
            status: OrderStatus.SHIPPED,
            courierName: 'Kerry Express',
            trackingNumber: 'TRACK123',
          }),
        }),
      );
    });
  });
});
