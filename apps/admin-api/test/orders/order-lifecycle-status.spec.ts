import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrdersService } from '../../src/modules/orders/orders.service.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  OrderStatus,
  PaymentStatus,
  ShipmentStatus,
  StockChangeType,
} from '@repo/types';
import { CarrierMockService } from '../../src/modules/orders/carrier/index.js';
import {
  LogisticsService,
  InternalLogisticsProvider,
  ShippopLogisticsProvider,
} from '../../src/modules/orders/logistics/index.js';
import type { OrderLifecycleProducerService } from '../../src/modules/order-lifecycle/order-lifecycle-producer.service.js';

describe('Order Lifecycle Status Coherence — Admin Back-Office Domain', () => {
  let service: OrdersService;
  let prismaMock: Record<string, unknown>;
  let paymentGatewayMock: { createRefund: ReturnType<typeof vi.fn> };

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
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      $transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
        callback(prismaMock),
      ),
    };

    const carrierMockService = new CarrierMockService();
    const internalProvider = new InternalLogisticsProvider(carrierMockService);
    const shippopProvider = new ShippopLogisticsProvider();
    const logisticsService = new LogisticsService(
      internalProvider,
      shippopProvider,
      prismaMock as never,
    );

    paymentGatewayMock = {
      createRefund: vi.fn().mockResolvedValue({
        gatewayRefundId: 'rfnd_omise_test_123',
        status: 'SUCCEEDED',
      }),
    };

    const orderLifecycleProducerMock = {
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
      prismaMock as never,
      { calculateCheckout: vi.fn() } as never,
      carrierMockService,
      logisticsService,
      paymentGatewayMock as never,
      orderLifecycleProducerMock as unknown as OrderLifecycleProducerService,
    );
  });

  const baseOrderFixture = {
    id: '11111111-2222-3333-4444-555555555555',
    orderNumber: 'NIDA-20261017-ADMIN01',
    status: OrderStatus.PENDING,
    hasPreorderItems: false,
    subtotal: 1500,
    discountTotal: 0,
    shippingFee: 50,
    taxAmount: 105,
    totalAmount: 1550,
    currency: 'THB',
    placedAt: new Date('2026-10-17T10:00:00Z'),
    shippingAddressSnapshot: {
      recipientName: 'Wiz Nu',
      phone: '0812345678',
      addressLine1: '999 Fashion Ave',
      subdistrict: 'Lumpini',
      district: 'Pathum Wan',
      province: 'Bangkok',
      postalCode: '10330',
    },
    items: [
      {
        id: 'item-1',
        productNameSnapshot: 'Silk Blouse',
        variantInfoSnapshot: 'Cream / M',
        unitPrice: 1500,
        quantity: 1,
        subtotal: 1500,
        discountShare: 0,
        netPrice: 1500,
        isPreorder: false,
        variant: {
          id: 'v-1',
          inventoryItem: { id: 'inv-1', quantityAvailable: 10, preorderBooked: 0 },
          product: { images: [{ imageUrl: 'https://cdn.example.com/item1.jpg', isPrimary: true }] },
        },
      },
    ],
    shipments: [],
    payment: {
      id: 'pay-1',
      status: PaymentStatus.PENDING,
      paymentMethod: 'PROMPTPAY',
      amount: 1550,
      currency: 'THB',
      transactionReference: 'chrg_test_admin_ref',
    },
    refunds: [],
    cancellationRequests: [],
    returnRequests: [],
    pointTransactions: [],
  };

  describe('Scenario 1 & 2: Forward Status Transitions & Shipment Guardrails', () => {
    it('transitions PENDING to PAID and synchronizes payment to CAPTURED with timestamp', async () => {
      const orderFind = prismaMock.order as { findFirst: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
      orderFind.findFirst.mockResolvedValueOnce(baseOrderFixture);
      orderFind.update.mockResolvedValueOnce({
        ...baseOrderFixture,
        status: OrderStatus.PAID,
        payment: {
          ...baseOrderFixture.payment,
          status: PaymentStatus.CAPTURED,
          paidAt: new Date(),
        },
      });

      const paymentUpdate = prismaMock.payment as { update: ReturnType<typeof vi.fn> };

      const result = await service.updateOrderStatus(
        baseOrderFixture.orderNumber,
        OrderStatus.PAID,
        undefined,
        undefined,
        'manual_admin_approval',
      );

      expect(paymentUpdate.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'pay-1' },
          data: expect.objectContaining({
            status: PaymentStatus.CAPTURED,
            transactionReference: 'manual_admin_approval',
          }),
        }),
      );
      expect(result.status).toBe(OrderStatus.PAID);
    });

    it('transitions PAID to PROCESSING successfully for in-stock fulfillment prep', async () => {
      const orderFind = prismaMock.order as { findFirst: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
      orderFind.findFirst.mockResolvedValueOnce({
        ...baseOrderFixture,
        status: OrderStatus.PAID,
      });
      orderFind.update.mockResolvedValueOnce({
        ...baseOrderFixture,
        status: OrderStatus.PROCESSING,
      });

      const result = await service.updateOrderStatus(
        baseOrderFixture.orderNumber,
        OrderStatus.PROCESSING,
      );

      expect(result.status).toBe(OrderStatus.PROCESSING);
    });

    it('transitions PREORDER_AWAITING_STOCK to PROCESSING upon factory stock arrival', async () => {
      const orderFind = prismaMock.order as { findFirst: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
      orderFind.findFirst.mockResolvedValueOnce({
        ...baseOrderFixture,
        status: OrderStatus.PREORDER_AWAITING_STOCK,
        hasPreorderItems: true,
      });
      orderFind.update.mockResolvedValueOnce({
        ...baseOrderFixture,
        status: OrderStatus.PROCESSING,
      });

      const result = await service.updateOrderStatus(
        baseOrderFixture.orderNumber,
        OrderStatus.PROCESSING,
      );

      expect(result.status).toBe(OrderStatus.PROCESSING);
    });

    it('requires tracking number when transitioning to SHIPPED', async () => {
      const orderFind = prismaMock.order as { findFirst: ReturnType<typeof vi.fn> };
      orderFind.findFirst.mockResolvedValueOnce({
        ...baseOrderFixture,
        status: OrderStatus.PROCESSING,
        shipments: [],
      });

      await expect(
        service.updateOrderStatus(
          baseOrderFixture.orderNumber,
          OrderStatus.SHIPPED,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates or updates shipment record when valid tracking number and courier are provided', async () => {
      const orderFind = prismaMock.order as { findFirst: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
      orderFind.findFirst.mockResolvedValueOnce({
        ...baseOrderFixture,
        status: OrderStatus.PROCESSING,
        shipments: [],
      });

      const shipmentCreate = prismaMock.shipment as { create: ReturnType<typeof vi.fn> };
      orderFind.update.mockResolvedValueOnce({
        ...baseOrderFixture,
        status: OrderStatus.SHIPPED,
        shipments: [
          {
            id: 'sh-1',
            courierName: 'KERRY',
            trackingNumber: 'KERRY-TRACK-999',
            status: ShipmentStatus.LABEL_CREATED,
            logs: [],
          },
        ],
      });

      const result = await service.updateOrderStatus(
        baseOrderFixture.orderNumber,
        OrderStatus.SHIPPED,
        'KERRY',
        'KERRY-TRACK-999',
      );

      expect(shipmentCreate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          courierName: 'KERRY',
          trackingNumber: 'KERRY-TRACK-999',
          status: ShipmentStatus.LABEL_CREATED,
        }),
      });
      expect(result.status).toBe(OrderStatus.SHIPPED);
    });

    it('transitions SHIPPED to DELIVERED when package arrives at customer destination', async () => {
      const orderFind = prismaMock.order as { findFirst: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
      orderFind.findFirst.mockResolvedValueOnce({
        ...baseOrderFixture,
        status: OrderStatus.SHIPPED,
        shipments: [
          {
            id: 'sh-1',
            trackingNumber: 'KERRY-TRACK-999',
            status: ShipmentStatus.IN_TRANSIT,
          },
        ],
      });
      orderFind.update.mockResolvedValueOnce({
        ...baseOrderFixture,
        status: OrderStatus.DELIVERED,
      });

      const result = await service.updateOrderStatus(
        baseOrderFixture.orderNumber,
        OrderStatus.DELIVERED,
      );

      expect(result.status).toBe(OrderStatus.DELIVERED);
    });

    it('strictly forbids skipping forward status steps (e.g. PENDING directly to SHIPPED)', async () => {
      const orderFind = prismaMock.order as { findFirst: ReturnType<typeof vi.fn> };
      orderFind.findFirst.mockResolvedValueOnce({
        ...baseOrderFixture,
        status: OrderStatus.PENDING,
      });

      await expect(
        service.updateOrderStatus(
          baseOrderFixture.orderNumber,
          OrderStatus.SHIPPED,
          'FLASH',
          'FLASH-999',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('transitions DELIVERED to COMPLETED, records completedAt timestamp, and credits loyalty points', async () => {
      const orderFind = prismaMock.order as {
        findFirst: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
      };
      const userMock = prismaMock.user as {
        findUnique: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
      };
      const pointTxMock = prismaMock.pointTransaction as {
        findFirst: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
      };

      orderFind.findFirst.mockResolvedValueOnce({
        ...baseOrderFixture,
        userId: 'usr-vip-01',
        status: OrderStatus.DELIVERED,
        totalAmount: 1550,
      });

      orderFind.update.mockResolvedValueOnce({
        ...baseOrderFixture,
        userId: 'usr-vip-01',
        status: OrderStatus.COMPLETED,
        completedAt: new Date(),
      });

      pointTxMock.findFirst.mockResolvedValueOnce(null);
      userMock.findUnique.mockResolvedValueOnce({
        id: 'usr-vip-01',
        points: 100,
      });

      const result = await service.updateOrderStatus(
        baseOrderFixture.orderNumber,
        OrderStatus.COMPLETED,
      );

      expect(orderFind.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: OrderStatus.COMPLETED,
            completedAt: expect.any(Date),
          }),
        }),
      );

      expect(userMock.update).toHaveBeenCalledWith({
        where: { id: 'usr-vip-01' },
        data: { points: 115 },
      });

      expect(pointTxMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'usr-vip-01',
            orderId: baseOrderFixture.id,
            pointsChange: 15,
            balanceAfter: 115,
          }),
        }),
      );

      expect(result.status).toBe(OrderStatus.COMPLETED);
    });

    it('strictly forbids transitioning to COMPLETED unless order is DELIVERED', async () => {
      const orderFind = prismaMock.order as { findFirst: ReturnType<typeof vi.fn> };
      orderFind.findFirst.mockResolvedValueOnce({
        ...baseOrderFixture,
        status: OrderStatus.SHIPPED,
      });

      await expect(
        service.updateOrderStatus(
          baseOrderFixture.orderNumber,
          OrderStatus.COMPLETED,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Scenario 3: Cancellation Review & Restock / Refund Synchronicity', () => {
    it('approves cancellation request, calls payment gateway refund, marks order REFUNDED and restores stock', async () => {
      const cancelFind = prismaMock.orderCancellationRequest as {
        findUnique: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
      };
      const orderFind = prismaMock.order as {
        findFirst: ReturnType<typeof vi.fn>;
        findUnique: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
      };
      const invUpdate = prismaMock.inventoryItem as { update: ReturnType<typeof vi.fn> };
      const stockMove = prismaMock.stockMovement as { create: ReturnType<typeof vi.fn> };

      cancelFind.findUnique.mockResolvedValueOnce({
        id: 'cr-1',
        orderId: baseOrderFixture.id,
        reason: 'Duplicate order by accident',
        status: 'PENDING',
        order: {
          ...baseOrderFixture,
          status: OrderStatus.PAID,
          payment: { ...baseOrderFixture.payment, status: PaymentStatus.CAPTURED },
        },
      });

      orderFind.findFirst.mockResolvedValueOnce({
        ...baseOrderFixture,
        status: OrderStatus.PAID,
        payment: { ...baseOrderFixture.payment, status: PaymentStatus.CAPTURED },
        refunds: [],
        pointTransactions: [],
      });

      orderFind.findUnique.mockResolvedValueOnce({
        ...baseOrderFixture,
        status: OrderStatus.REFUNDED,
        payment: { ...baseOrderFixture.payment, status: PaymentStatus.REFUNDED },
      });

      invUpdate.update.mockResolvedValueOnce({ id: 'inv-1', quantityAvailable: 11 });

      const reviewResult = await service.reviewCancellationRequest(
        'cr-1',
        { action: 'APPROVE', adminNote: 'Cancellation approved by supervisor', restockInventory: true },
        'admin-user-01',
      );

      expect(reviewResult.success).toBe(true);
      expect(paymentGatewayMock.createRefund).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionReference: 'chrg_test_admin_ref',
          amount: 1550,
        }),
      );
      expect(invUpdate.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv-1' },
          data: { quantityAvailable: { increment: 1 } },
        }),
      );
      expect(stockMove.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            changeType: StockChangeType.RETURNED,
            quantityChange: 1,
          }),
        }),
      );
    });

    it('rejects cancellation request without issuing refund or modifying order/stock', async () => {
      const cancelFind = prismaMock.orderCancellationRequest as {
        findUnique: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
      };
      cancelFind.findUnique.mockResolvedValueOnce({
        id: 'cr-2',
        orderId: baseOrderFixture.id,
        reason: 'Changed mind after package dispatch',
        status: 'PENDING',
        order: {
          ...baseOrderFixture,
          status: OrderStatus.PROCESSING,
          payment: { ...baseOrderFixture.payment, status: PaymentStatus.CAPTURED },
        },
      });

      const invUpdate = prismaMock.inventoryItem as { update: ReturnType<typeof vi.fn> };

      const reviewResult = await service.reviewCancellationRequest(
        'cr-2',
        { action: 'REJECT', adminNote: 'Order is packed and waiting carrier courier' },
        'admin-user-01',
      );

      expect(reviewResult.success).toBe(true);
      expect(cancelFind.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cr-2' },
          data: expect.objectContaining({ status: 'REJECTED' }),
        }),
      );
      expect(paymentGatewayMock.createRefund).not.toHaveBeenCalled();
      expect(invUpdate.update).not.toHaveBeenCalled();
    });

    it('forbids re-evaluating an already reviewed cancellation request', async () => {
      const cancelFind = prismaMock.orderCancellationRequest as { findUnique: ReturnType<typeof vi.fn> };
      cancelFind.findUnique.mockResolvedValueOnce({
        id: 'cr-already-settled',
        status: 'APPROVED',
      });

      await expect(
        service.reviewCancellationRequest('cr-already-settled', { action: 'APPROVE' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Scenario 4: Return Review, QC Inspection & Restocking', () => {
    it('approves customer return request so customer can send package back', async () => {
      const returnFind = prismaMock.returnRequest as {
        findUnique: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
      };
      returnFind.findUnique.mockResolvedValueOnce({
        id: 'ret-1',
        orderId: baseOrderFixture.id,
        reason: 'Wrong size chosen',
        status: 'PENDING',
        order: {
          ...baseOrderFixture,
          status: OrderStatus.DELIVERED,
        },
      });

      const result = await service.reviewReturnRequest(
        'ret-1',
        { action: 'APPROVE', adminNote: 'Return authorized. Please ship back within 7 days.' },
        'admin-01',
      );

      expect(result.success).toBe(true);
      expect(returnFind.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ret-1' },
          data: expect.objectContaining({ status: 'APPROVED' }),
        }),
      );
    });

    it('completes return upon QC passing, executes refund, and restocks inventory', async () => {
      const returnFind = prismaMock.returnRequest as {
        findUnique: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
      };
      const orderFind = prismaMock.order as {
        findFirst: ReturnType<typeof vi.fn>;
        findUnique: ReturnType<typeof vi.fn>;
      };
      const invUpdate = prismaMock.inventoryItem as { update: ReturnType<typeof vi.fn> };

      returnFind.findUnique.mockResolvedValueOnce({
        id: 'ret-pass',
        orderId: baseOrderFixture.id,
        reason: 'Wrong size chosen',
        status: 'APPROVED',
        order: {
          ...baseOrderFixture,
          status: OrderStatus.DELIVERED,
          payment: { ...baseOrderFixture.payment, status: PaymentStatus.CAPTURED },
        },
      });

      orderFind.findFirst.mockResolvedValueOnce({
        ...baseOrderFixture,
        status: OrderStatus.DELIVERED,
        payment: { ...baseOrderFixture.payment, status: PaymentStatus.CAPTURED },
        refunds: [],
        pointTransactions: [],
      });

      orderFind.findUnique.mockResolvedValueOnce({
        ...baseOrderFixture,
        status: OrderStatus.REFUNDED,
        payment: { ...baseOrderFixture.payment, status: PaymentStatus.REFUNDED },
      });

      invUpdate.update.mockResolvedValueOnce({ id: 'inv-1', quantityAvailable: 11 });

      const result = await service.reviewReturnRequest(
        'ret-pass',
        {
          action: 'COMPLETE',
          adminNote: 'QC verified: tags intact, unworn',
          refundAmount: 1550,
          restockInventory: true,
        },
        'admin-qc-01',
      );

      expect(result.success).toBe(true);
      expect(returnFind.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ret-pass' },
          data: expect.objectContaining({ status: 'COMPLETED' }),
        }),
      );
      expect(invUpdate.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv-1' },
          data: { quantityAvailable: { increment: 1 } },
        }),
      );
    });

    it('rejects return request when QC fails and does not restock or refund', async () => {
      const returnFind = prismaMock.returnRequest as {
        findUnique: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
      };
      returnFind.findUnique.mockResolvedValueOnce({
        id: 'ret-fail',
        orderId: baseOrderFixture.id,
        status: 'APPROVED',
      });

      const invUpdate = prismaMock.inventoryItem as { update: ReturnType<typeof vi.fn> };

      const result = await service.reviewReturnRequest(
        'ret-fail',
        { action: 'REJECT', adminNote: 'Item shows signs of heavy wear and missing tags' },
        'admin-qc-01',
      );

      expect(result.success).toBe(true);
      expect(returnFind.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ret-fail' },
          data: expect.objectContaining({ status: 'REJECTED' }),
        }),
      );
      expect(paymentGatewayMock.createRefund).not.toHaveBeenCalled();
      expect(invUpdate.update).not.toHaveBeenCalled();
    });
  });

  describe('Scenario 5: Refund Invariants & Quota Guardrails', () => {
    it('throws BadRequestException if attempting to refund an order with zero or negative amount', async () => {
      const orderFind = prismaMock.order as { findFirst: ReturnType<typeof vi.fn> };
      orderFind.findFirst.mockResolvedValueOnce({
        ...baseOrderFixture,
        payment: { ...baseOrderFixture.payment, status: PaymentStatus.CAPTURED, amount: 1550 },
        refunds: [],
      });

      await expect(
        service.processRefund(baseOrderFixture.orderNumber, {
          amount: 0,
          reason: 'Zero refund attempt',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if refund exceeds maximum refundable balance', async () => {
      const orderFind = prismaMock.order as { findFirst: ReturnType<typeof vi.fn> };
      orderFind.findFirst.mockResolvedValueOnce({
        ...baseOrderFixture,
        payment: { ...baseOrderFixture.payment, status: PaymentStatus.CAPTURED, amount: 1550 },
        refunds: [
          { id: 'rf-prev', amount: 1000, status: 'SUCCEEDED' },
        ],
      });

      await expect(
        service.processRefund(baseOrderFixture.orderNumber, {
          amount: 600,
          reason: 'Excess refund amount',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('supports partial refund without altering OrderStatus until full amount is reached', async () => {
      const orderFind = prismaMock.order as {
        findFirst: ReturnType<typeof vi.fn>;
        findUnique: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
      };
      const refundCreate = prismaMock.refund as { create: ReturnType<typeof vi.fn> };

      orderFind.findFirst.mockResolvedValueOnce({
        ...baseOrderFixture,
        status: OrderStatus.DELIVERED,
        payment: { ...baseOrderFixture.payment, status: PaymentStatus.CAPTURED, amount: 1550 },
        refunds: [],
        pointTransactions: [],
      });

      orderFind.findUnique.mockResolvedValueOnce({
        ...baseOrderFixture,
        status: OrderStatus.DELIVERED,
        payment: { ...baseOrderFixture.payment, status: PaymentStatus.CAPTURED },
        refunds: [
          {
            id: 'rf-1',
            refundNumber: 'REF-1',
            orderId: baseOrderFixture.id,
            paymentId: 'pay-1',
            amount: 500,
            status: 'SUCCEEDED',
            createdAt: new Date('2026-10-17T11:00:00Z'),
          },
        ],
      });

      await service.processRefund(baseOrderFixture.orderNumber, {
        amount: 500,
        reason: 'Partial compensation for courier delay',
        restockInventory: false,
      });

      expect(refundCreate.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: 500,
            status: 'SUCCEEDED',
          }),
        }),
      );
      expect(orderFind.update).not.toHaveBeenCalled();
    });

    it('reverses loyalty points earned on the refunded order when user is registered', async () => {
      const orderFind = prismaMock.order as {
        findFirst: ReturnType<typeof vi.fn>;
        findUnique: ReturnType<typeof vi.fn>;
      };
      const userMock = prismaMock.user as {
        findUnique: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
      };
      const pointTxMock = prismaMock.pointTransaction as { create: ReturnType<typeof vi.fn> };

      orderFind.findFirst.mockResolvedValueOnce({
        ...baseOrderFixture,
        userId: 'user-vip-01',
        payment: { ...baseOrderFixture.payment, status: PaymentStatus.CAPTURED, amount: 1550 },
        refunds: [],
        pointTransactions: [
          { changeType: 'EARNED_ORDER', pointsChange: 155 },
        ],
      });

      userMock.findUnique.mockResolvedValueOnce({
        id: 'user-vip-01',
        points: 500,
      });

      orderFind.findUnique.mockResolvedValueOnce({
        ...baseOrderFixture,
        status: OrderStatus.REFUNDED,
        payment: { ...baseOrderFixture.payment, status: PaymentStatus.REFUNDED },
      });

      await service.processRefund(baseOrderFixture.orderNumber, {
        amount: 1550,
        reason: 'Full order return and refund',
        restockInventory: false,
      });

      expect(userMock.update).toHaveBeenCalledWith({
        where: { id: 'user-vip-01' },
        data: { points: 345 },
      });
      expect(pointTxMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-vip-01',
            changeType: 'REFUND_CANCEL',
            pointsChange: -155,
            balanceAfter: 345,
          }),
        }),
      );
    });
  });
});
