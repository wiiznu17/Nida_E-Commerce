import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CustomerOrdersService } from '../../src/modules/orders/orders.service.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  StockChangeType,
} from '@repo/types';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { MailerService } from '../../src/core/mailer/mailer.service.js';
import type { OmiseService } from '../../src/modules/orders/omise.service.js';
import type { OrderLifecycleProducerService } from '../../src/modules/order-lifecycle/order-lifecycle-producer.service.js';
import type { RedisService } from '../../src/core/redis/redis.service.js';

describe('Order Lifecycle Status Coherence — Storefront Customer Domain', () => {
  let service: CustomerOrdersService;
  let prismaMock: {
    productVariant: { findMany: ReturnType<typeof vi.fn> };
    promotionCoupon: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
    couponRedemption: { count: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
    order: {
      findUnique: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    orderItem: { create: ReturnType<typeof vi.fn> };
    inventoryItem: {
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      updateMany: ReturnType<typeof vi.fn>;
    };
    stockMovement: { create: ReturnType<typeof vi.fn> };
    orderCancellationRequest: { create: ReturnType<typeof vi.fn> };
    returnRequest: {
      create: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
    };
    payment: { create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
    user: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
    pointTransaction: { findFirst: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
    $transaction: ReturnType<typeof vi.fn>;
  };
  let mailerMock: { sendOrderConfirmation: ReturnType<typeof vi.fn> };
  let omiseMock: {
    createPromptPayCharge: ReturnType<typeof vi.fn>;
    createCreditCardCharge: ReturnType<typeof vi.fn>;
    getCharge: ReturnType<typeof vi.fn>;
    simulateMarkAsPaid: ReturnType<typeof vi.fn>;
  };
  let orderLifecycleProducerMock: {
    scheduleOrderTimeout: ReturnType<typeof vi.fn>;
    cancelOrderTimeout: ReturnType<typeof vi.fn>;
    scheduleCancellationReviewTimeout: ReturnType<typeof vi.fn>;
    cancelCancellationReviewTimeout: ReturnType<typeof vi.fn>;
    scheduleDeliveryCompletion: ReturnType<typeof vi.fn>;
    cancelDeliveryCompletion: ReturnType<typeof vi.fn>;
    scheduleReturnDeadline: ReturnType<typeof vi.fn>;
    cancelReturnDeadline: ReturnType<typeof vi.fn>;
  };
  let redisMock: {
    checkRateLimit: ReturnType<typeof vi.fn>;
  };

  const createMockOrderRecord = (overrides?: Record<string, unknown>) => ({
    id: 'ord-uuid-1',
    orderNumber: 'NIDA-20261017-TEST',
    userId: 'usr-1',
    status: OrderStatus.PENDING,
    hasPreorderItems: false,
    subtotal: 2500,
    discountTotal: 0,
    shippingFee: 0,
    taxAmount: 0,
    totalAmount: 2500,
    currency: 'THB',
    shippingAddressSnapshot: { recipientName: 'Customer Test', phone: '0812345678' },
    promoCodeUsed: null,
    placedAt: new Date(),
    items: [],
    payment: {
      id: 'pay-1',
      paymentMethod: PaymentMethod.PROMPTPAY,
      amount: 2500,
      currency: 'THB',
      status: PaymentStatus.PENDING,
      paidAt: null,
      rawWebhookPayload: { switchCount: 0, lastSwitchedAt: null },
    },
    shipments: [],
    cancellationRequests: [],
    returnRequests: [],
    refunds: [],
    ...overrides,
  });

  beforeEach(() => {
    prismaMock = {
      productVariant: { findMany: vi.fn() },
      promotionCoupon: { findUnique: vi.fn(), update: vi.fn() },
      couponRedemption: { count: vi.fn(), create: vi.fn() },
      order: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      orderItem: { create: vi.fn() },
      inventoryItem: {
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      stockMovement: { create: vi.fn() },
      orderCancellationRequest: {
        create: vi.fn().mockResolvedValue({ id: 'can-req-1', status: 'PENDING' }),
      },
      returnRequest: { create: vi.fn(), findFirst: vi.fn().mockResolvedValue(null) },
      payment: {
        create: vi.fn().mockResolvedValue({ id: 'pay-new' }),
        update: vi.fn().mockResolvedValue({ id: 'pay-upd' }),
      },
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: 'usr-1', points: 50 }),
        update: vi.fn().mockResolvedValue({ id: 'usr-1', points: 75 }),
      },
      pointTransaction: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'pt-1' }),
      },
      $transaction: vi.fn(async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
        callback(prismaMock),
      ),
    };

    mailerMock = {
      sendOrderConfirmation: vi.fn().mockResolvedValue(undefined),
    };

    omiseMock = {
      createPromptPayCharge: vi.fn().mockResolvedValue({
        chargeId: 'chrg_test_promptpay_init',
        qrDownloadUri: 'https://api.omise.co/qr_init.svg',
        expiresAt: '2026-10-18T10:00:00Z',
        status: 'pending',
      }),
      createCreditCardCharge: vi.fn().mockResolvedValue({
        chargeId: 'chrg_test_card_captured',
        status: 'successful',
        authorizeUri: null,
        failureCode: null,
        failureMessage: null,
        cardBrand: 'Visa',
        cardLast4: '4242',
      }),
      getCharge: vi.fn().mockResolvedValue({
        id: 'chrg_test_sync',
        status: 'successful',
        paid: true,
      }),
      simulateMarkAsPaid: vi.fn().mockResolvedValue({
        id: 'chrg_test_sim',
        status: 'successful',
        paid: true,
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

    redisMock = {
      checkRateLimit: vi.fn().mockResolvedValue({
        allowed: true,
        remaining: 1,
        retryAfter: 2,
      }),
    };

    service = new CustomerOrdersService(
      prismaMock as unknown as PrismaService,
      mailerMock as unknown as MailerService,
      omiseMock as unknown as OmiseService,
      orderLifecycleProducerMock as unknown as OrderLifecycleProducerService,
      redisMock as unknown as RedisService,
    );
  });

  describe('Scenario 1 & 2: Order Placement Initial Statuses & Preorder Branching', () => {
    it('initializes in-stock order with PENDING OrderStatus and PENDING PaymentStatus, deducting stock', async () => {
      prismaMock.productVariant.findMany.mockResolvedValue([
        {
          id: 'var-instock-1',
          skuCode: 'SKU-INSTOCK-1',
          price: 2500,
          inventoryItem: { id: 'inv-1', quantityAvailable: 10, preorderBooked: 0 },
          product: { name: 'Cashmere Cardigan', isPreorder: false, images: [] },
          color: { nameTh: 'Espresso' },
          size: { name: 'M' },
        },
      ]);
      prismaMock.inventoryItem.update.mockResolvedValue({ id: 'inv-1', count: 1 });
      prismaMock.inventoryItem.findUnique.mockResolvedValue({ quantityAvailable: 9 });
      prismaMock.order.create.mockResolvedValue(createMockOrderRecord());
      prismaMock.order.findUnique.mockResolvedValue(createMockOrderRecord());

      const result = await service.createOrder(
        {
          items: [{ variantId: 'var-instock-1', quantity: 1 }],
          shippingAddress: {
            recipientName: 'Customer Test',
            phone: '0812345678',
            addressLine1: 'Sukhumvit 24',
            subdistrict: 'Khlong Tan',
            district: 'Khlong Toei',
            province: 'Bangkok',
            postalCode: '10110',
          },
          paymentMethod: PaymentMethod.PROMPTPAY,
        },
        'usr-1',
      );

      expect(result.status).toBe(OrderStatus.PENDING);
      expect(result.payment?.status).toBe(PaymentStatus.PENDING);
      expect(result.hasPreorderItems).toBe(false);
      expect(prismaMock.stockMovement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          changeType: StockChangeType.ORDER_DEDUCT,
          quantityChange: -1,
        }),
      });
    });

    it('initializes pre-order checkout by recording preorderBooked without decrementing available stock', async () => {
      prismaMock.productVariant.findMany.mockResolvedValue([
        {
          id: 'var-preorder-1',
          skuCode: 'SKU-PREORDER-1',
          price: 4900,
          inventoryItem: { id: 'inv-pre-1', quantityAvailable: 0, preorderBooked: 2 },
          product: { name: 'Wool Coat Runway', isPreorder: true, images: [] },
          color: { nameTh: 'Camel' },
          size: { name: 'L' },
        },
      ]);
      prismaMock.inventoryItem.update.mockResolvedValue({ id: 'inv-pre-1', count: 1 });
      prismaMock.order.create.mockResolvedValue(
        createMockOrderRecord({ hasPreorderItems: true, totalAmount: 4900 }),
      );
      prismaMock.order.findUnique.mockResolvedValue(
        createMockOrderRecord({ hasPreorderItems: true, totalAmount: 4900 }),
      );

      const result = await service.createOrder(
        {
          items: [{ variantId: 'var-preorder-1', quantity: 1 }],
          shippingAddress: {
            recipientName: 'Customer Test',
            phone: '0812345678',
            addressLine1: 'Sukhumvit 24',
            subdistrict: 'Khlong Tan',
            district: 'Khlong Toei',
            province: 'Bangkok',
            postalCode: '10110',
          },
          paymentMethod: PaymentMethod.PROMPTPAY,
        },
        'usr-1',
      );

      expect(result.status).toBe(OrderStatus.PENDING);
      expect(result.hasPreorderItems).toBe(true);
      expect(prismaMock.inventoryItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { preorderBooked: { increment: 1 } },
        }),
      );
      expect(prismaMock.stockMovement.create).not.toHaveBeenCalled();
    });
  });

  describe('Scenario 3: Payment Capture & Status Synchronization', () => {
    it('synchronizes in-stock order to PAID and CAPTURED upon successful credit card payment', async () => {
      const mockPendingOrder = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-PAID',
        hasPreorderItems: false,
      });
      const mockPaidOrder = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-PAID',
        status: OrderStatus.PAID,
        payment: {
          id: 'pay-1',
          paymentMethod: PaymentMethod.CREDIT_CARD,
          status: PaymentStatus.CAPTURED,
          paidAt: new Date(),
          amount: 2500,
        },
      });

      prismaMock.order.findUnique
        .mockResolvedValueOnce(mockPendingOrder)
        .mockResolvedValueOnce(mockPaidOrder);

      const result = await service.payOrder(
        'NIDA-20261017-PAID',
        'usr-1',
        {
          paymentMethod: PaymentMethod.CREDIT_CARD,
          omiseToken: 'tokn_test_123',
          cardLast4: '4242',
          cardBrand: 'Visa',
        },
      );

      expect(prismaMock.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: PaymentStatus.CAPTURED,
          }),
        }),
      );
      expect(prismaMock.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: OrderStatus.PAID },
        }),
      );
      expect(result.order.status).toBe(OrderStatus.PAID);
    });

    it('synchronizes pre-order to PREORDER_AWAITING_STOCK instead of PAID upon payment capture', async () => {
      const mockPendingPreorder = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-PREAWAIT',
        hasPreorderItems: true,
      });
      const mockAwaitingOrder = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-PREAWAIT',
        status: OrderStatus.PREORDER_AWAITING_STOCK,
        hasPreorderItems: true,
        payment: {
          id: 'pay-1',
          paymentMethod: PaymentMethod.CREDIT_CARD,
          status: PaymentStatus.CAPTURED,
          paidAt: new Date(),
          amount: 2500,
        },
      });

      prismaMock.order.findUnique
        .mockResolvedValueOnce(mockPendingPreorder)
        .mockResolvedValueOnce(mockAwaitingOrder);

      const result = await service.payOrder(
        'NIDA-20261017-PREAWAIT',
        'usr-1',
        {
          paymentMethod: PaymentMethod.CREDIT_CARD,
          omiseToken: 'tokn_test_pre',
          cardLast4: '1111',
          cardBrand: 'MasterCard',
        },
      );

      expect(prismaMock.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: OrderStatus.PREORDER_AWAITING_STOCK },
        }),
      );
      expect(result.order.status).toBe(OrderStatus.PREORDER_AWAITING_STOCK);
    });

    it('forbids paying an order that has already been settled and returns existing order without mutation', async () => {
      const mockAlreadyPaidOrder = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-SETTLED',
        status: OrderStatus.PAID,
      });

      prismaMock.order.findUnique
        .mockResolvedValueOnce(mockAlreadyPaidOrder)
        .mockResolvedValueOnce(mockAlreadyPaidOrder);

      const result = await service.payOrder(
        'NIDA-20261017-SETTLED',
        'usr-1',
        { paymentMethod: PaymentMethod.PROMPTPAY },
      );

      expect(result.order.status).toBe(OrderStatus.PAID);
      expect(prismaMock.order.update).not.toHaveBeenCalled();
      expect(prismaMock.payment.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException if user tries to pay an order belonging to another customer', async () => {
      const mockForeignOrder = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-FOREIGN',
        userId: 'other-user-999',
      });

      prismaMock.order.findUnique.mockResolvedValue(mockForeignOrder);

      await expect(
        service.payOrder(
          'NIDA-20261017-FOREIGN',
          'usr-1',
          { paymentMethod: PaymentMethod.PROMPTPAY },
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Scenario 4: Deliberate Payment Method Switching', () => {
    it('successfully updates paymentMethod without altering stock or prematurely completing order', async () => {
      const mockOrderPending = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-SWITCH',
        payment: {
          id: 'pay-switch',
          paymentMethod: PaymentMethod.PROMPTPAY,
          status: PaymentStatus.PENDING,
          rawWebhookPayload: { switchCount: 0, lastSwitchedAt: null },
        },
      });
      const mockOrderUpdated = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-SWITCH',
        payment: {
          id: 'pay-switch',
          paymentMethod: PaymentMethod.CREDIT_CARD,
          status: PaymentStatus.PENDING,
          rawWebhookPayload: { switchCount: 1, lastSwitchedAt: new Date().toISOString() },
        },
      });

      prismaMock.order.findUnique
        .mockResolvedValueOnce(mockOrderPending)
        .mockResolvedValueOnce(mockOrderUpdated);

      const result = await service.updatePaymentMethod(
        'NIDA-20261017-SWITCH',
        PaymentMethod.CREDIT_CARD,
        'usr-1',
      );

      expect(prismaMock.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            paymentMethod: PaymentMethod.CREDIT_CARD,
          }),
        }),
      );
      expect(prismaMock.stockMovement.create).not.toHaveBeenCalled();
      expect(prismaMock.order.update).not.toHaveBeenCalled();
      expect(result.payment?.paymentMethod).toBe(PaymentMethod.CREDIT_CARD);
    });

    it('allows updating payment method seamlessly for pending orders without hard limits', async () => {
      const mockOrder = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-LIMIT',
        payment: {
          id: 'pay-limit',
          paymentMethod: PaymentMethod.PROMPTPAY,
          status: PaymentStatus.PENDING,
          rawWebhookPayload: { lastSwitchedAt: '2026-10-17T12:00:00Z' },
        },
      });

      prismaMock.order.findUnique.mockResolvedValue(mockOrder);
      prismaMock.payment.update.mockResolvedValue({ id: 'pay-limit' });

      const result = await service.updatePaymentMethod(
        'NIDA-20261017-LIMIT',
        PaymentMethod.CREDIT_CARD,
        'usr-1',
      );
      expect(result).toBeDefined();
    });

    it('rejects payment method switch when requested within 2-second cooldown window', async () => {
      redisMock.checkRateLimit.mockResolvedValueOnce({
        allowed: false,
        remaining: 0,
        retryAfter: 2,
      });

      prismaMock.order.findUnique.mockResolvedValue(
        createMockOrderRecord({ status: OrderStatus.PENDING }),
      );

      await expect(
        service.updatePaymentMethod('NIDA-20261017-LIMIT', PaymentMethod.CREDIT_CARD, 'usr-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects updating payment method when order status is no longer PENDING', async () => {
      const mockOrderPaid = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-ALREADYPAID',
        status: OrderStatus.PAID,
      });

      prismaMock.order.findUnique.mockResolvedValue(mockOrderPaid);

      await expect(
        service.updatePaymentMethod(
          'NIDA-20261017-ALREADYPAID',
          PaymentMethod.CREDIT_CARD,
          'usr-1',
        ),
      ).rejects.toThrow('สามารถเปลี่ยนวิธีชำระเงินได้เฉพาะคำสั่งซื้อที่ยังไม่ได้ชำระเงินเท่านั้น');
    });

    it('rejects payment method switch when remaining time before order timeout is 1 minute or less', async () => {
      // Placed 14 minutes and 30 seconds ago (only 30 seconds remaining of 15m window)
      const nearExpiredPlacedAt = new Date(Date.now() - 14.5 * 60 * 1000);
      const mockOrderNearExpired = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-NEAR-EXP',
        placedAt: nearExpiredPlacedAt,
        payment: {
          id: 'pay-near-exp',
          paymentMethod: PaymentMethod.PROMPTPAY,
          status: PaymentStatus.PENDING,
          rawWebhookPayload: {},
        },
      });

      prismaMock.order.findUnique.mockResolvedValue(mockOrderNearExpired);

      await expect(
        service.updatePaymentMethod(
          'NIDA-20261017-NEAR-EXP',
          PaymentMethod.CREDIT_CARD,
          'usr-1',
        ),
      ).rejects.toThrow('คำสั่งซื้อนี้ใกล้หมดเวลาชำระเงินแล้ว ไม่สามารถสลับช่องทางได้ กรุณาสั่งซื้อใหม่อีกครั้ง');
    });

    it('synchronizes PromptPay QR expires_at with original placedAt + 15m and preserves queue timer without resetting', async () => {
      const placedAt = new Date(Date.now() - 5 * 60 * 1000); // Placed 5m ago, 10m remaining
      const expectedDeadline = new Date(placedAt.getTime() + 15 * 60 * 1000);

      const mockOrderCard = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-SYNC-EXP',
        placedAt,
        payment: {
          id: 'pay-sync-exp',
          paymentMethod: PaymentMethod.CREDIT_CARD,
          status: PaymentStatus.PENDING,
          rawWebhookPayload: {},
        },
      });

      prismaMock.order.findUnique
        .mockResolvedValueOnce(mockOrderCard)
        .mockResolvedValueOnce(mockOrderCard);

      await service.updatePaymentMethod(
        'NIDA-20261017-SYNC-EXP',
        PaymentMethod.PROMPTPAY,
        'usr-1',
      );

      // Verify Omise createPromptPayCharge was called with exact synchronized expiration
      expect(omiseMock.createPromptPayCharge).toHaveBeenCalledWith(
        'NIDA-20261017-SYNC-EXP',
        2500,
        expectedDeadline,
      );

      // Verify that orderLifecycleProducer.scheduleOrderTimeout was NOT called (no timer reset)
      expect(orderLifecycleProducerMock.scheduleOrderTimeout).not.toHaveBeenCalled();
    });
  });

  describe('Scenario 5 & 6: Cancellation & Return Request Invariants', () => {
    it('creates PENDING cancellation request for a paid order', async () => {
      const mockPaidOrder = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-CANREQ',
        status: OrderStatus.PAID,
        cancellationRequests: [],
      });

      prismaMock.order.findUnique
        .mockResolvedValueOnce(mockPaidOrder)
        .mockResolvedValueOnce({
          ...mockPaidOrder,
          cancellationRequests: [
            {
              id: 'can-1',
              requestNumber: 'CAN-NIDA-20261017-CANREQ-1',
              status: 'PENDING',
              reason: 'Customer changed mind',
              createdAt: new Date(),
            },
          ],
        });

      await service.requestCancellation(
        'NIDA-20261017-CANREQ',
        { reason: 'Customer changed mind' },
        'usr-1',
      );

      expect(prismaMock.orderCancellationRequest.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'PENDING',
          reason: 'Customer changed mind',
        }),
      });
    });

    it('forbids cancellation request if order is already SHIPPED or DELIVERED', async () => {
      const mockShippedOrder = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-SHIPPEDCAN',
        status: OrderStatus.SHIPPED,
      });

      prismaMock.order.findUnique.mockResolvedValue(mockShippedOrder);

      await expect(
        service.requestCancellation(
          'NIDA-20261017-SHIPPEDCAN',
          { reason: 'Cancel parcel in transit' },
          'usr-1',
        ),
      ).rejects.toThrow('คำสั่งซื้ออยู่ในขั้นตอนจัดส่งหรือสำเร็จแล้ว ไม่สามารถขอยกเลิกได้');
    });

    it('submits return request only when order is DELIVERED and quantity does not exceed purchased', async () => {
      const mockDeliveredOrder = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-RETREQ',
        status: OrderStatus.DELIVERED,
        items: [
          {
            id: 'item-1',
            variantId: 'var-1',
            productNameSnapshot: 'Silk Blouse',
            variantInfoSnapshot: 'White / S',
            unitPrice: 2500,
            quantity: 2,
            subtotal: 5000,
            discountShare: 0,
            netPrice: 2500,
            isPreorder: false,
            expectedShipDate: null,
          },
        ],
        returnRequests: [],
      });

      prismaMock.order.findUnique
        .mockResolvedValueOnce(mockDeliveredOrder)
        .mockResolvedValueOnce(mockDeliveredOrder);

      await service.requestReturn(
        'NIDA-20261017-RETREQ',
        {
          reason: 'Size does not fit',
          items: [{ orderItemId: 'item-1', quantity: 1 }],
        },
        'usr-1',
      );

      expect(prismaMock.returnRequest.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'REQUESTED',
          reason: 'Size does not fit',
        }),
      });
    });

    it('forbids return request if order status is not DELIVERED', async () => {
      const mockProcessingOrder = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-NOTDEL',
        status: OrderStatus.PROCESSING,
        items: [{ id: 'item-1', quantity: 1 }],
      });

      prismaMock.order.findUnique.mockResolvedValue(mockProcessingOrder);

      await expect(
        service.requestReturn(
          'NIDA-20261017-NOTDEL',
          {
            reason: 'Item defective',
            items: [{ orderItemId: 'item-1', quantity: 1 }],
          },
          'usr-1',
        ),
      ).rejects.toThrow('สามารถขอคืนสินค้าได้เฉพาะคำสั่งซื้อที่จัดส่งสำเร็จแล้วเท่านั้น');
    });
  });

  describe('Scenario 7: Gateway Webhook Processing & Idempotency', () => {
    it('idempotently marks PENDING order as PAID when Omise webhook arrives with charge.complete success', async () => {
      const mockPendingOrder = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-WEBHOOK',
        status: OrderStatus.PENDING,
        hasPreorderItems: false,
      });

      prismaMock.order.findUnique.mockResolvedValue(mockPendingOrder);

      const response = await service.handleOmiseWebhook({
        key: 'charge.complete',
        data: {
          id: 'chrg_test_wh_success',
          status: 'successful',
          metadata: { orderNumber: 'NIDA-20261017-WEBHOOK' },
        },
      });

      expect(response.received).toBe(true);
      expect(prismaMock.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: PaymentStatus.CAPTURED }),
        }),
      );
      expect(prismaMock.order.update).toHaveBeenCalledWith({
        where: { id: mockPendingOrder.id },
        data: { status: OrderStatus.PAID },
      });
    });

    it('ignores webhook charge success if order status is already settled or cancelled', async () => {
      const mockSettledOrder = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-SETTLED',
        status: OrderStatus.PAID,
        payment: { id: 'pay-settled', status: PaymentStatus.CAPTURED },
      });

      prismaMock.order.findUnique.mockResolvedValue(mockSettledOrder);

      await service.handleOmiseWebhook({
        key: 'charge.complete',
        data: {
          id: 'chrg_test_duplicate',
          status: 'successful',
          metadata: { orderNumber: 'NIDA-20261017-SETTLED' },
        },
      });

      expect(prismaMock.order.update).not.toHaveBeenCalled();
    });
  });

  describe('Scenario 8: Customer Delivery Acceptance (COMPLETED) & 7-Day Return Window Safeguard', () => {
    it('accepts delivered order, transitions to COMPLETED, records completedAt, and awards loyalty points', async () => {
      const mockDeliveredOrder = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-ACCEPT',
        userId: 'usr-1',
        status: OrderStatus.DELIVERED,
        totalAmount: 2500,
        items: [],
      });

      const mockCompletedOrder = {
        ...mockDeliveredOrder,
        status: OrderStatus.COMPLETED,
        completedAt: new Date(),
      };

      prismaMock.order.findUnique
        .mockResolvedValueOnce(mockDeliveredOrder)
        .mockResolvedValueOnce(mockCompletedOrder);

      const result = await service.acceptOrder('NIDA-20261017-ACCEPT', 'usr-1');

      expect(prismaMock.order.update).toHaveBeenCalledWith({
        where: { id: mockDeliveredOrder.id },
        data: expect.objectContaining({
          status: OrderStatus.COMPLETED,
          completedAt: expect.any(Date),
        }),
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'usr-1' },
        data: {
          points: 75, // 50 + Math.floor(2500 / 100) = 75
        },
      });

      expect(prismaMock.pointTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'usr-1',
            orderId: mockDeliveredOrder.id,
            pointsChange: 25,
            balanceAfter: 75,
          }),
        }),
      );

      expect(result.status).toBe(OrderStatus.COMPLETED);
    });

    it('rejects acceptOrder when order is not in DELIVERED status', async () => {
      const mockShippedOrder = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-SHIPPED',
        userId: 'usr-1',
        status: OrderStatus.SHIPPED,
      });

      prismaMock.order.findUnique.mockResolvedValueOnce(mockShippedOrder);

      await expect(
        service.acceptOrder('NIDA-20261017-SHIPPED', 'usr-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects acceptOrder when customer does not own the order', async () => {
      const mockOrder = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-OTHER',
        userId: 'other-user',
        status: OrderStatus.DELIVERED,
      });

      prismaMock.order.findUnique.mockResolvedValueOnce(mockOrder);

      await expect(
        service.acceptOrder('NIDA-20261017-OTHER', 'usr-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects acceptOrder when there is an active return request', async () => {
      const mockDeliveredOrder = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-HAS-RETURN',
        userId: 'usr-1',
        status: OrderStatus.DELIVERED,
      });

      prismaMock.order.findUnique.mockResolvedValueOnce(mockDeliveredOrder);
      prismaMock.returnRequest.findFirst.mockResolvedValueOnce({
        id: 'ret-active',
        orderId: mockDeliveredOrder.id,
        status: 'REQUESTED',
      });

      await expect(
        service.acceptOrder('NIDA-20261017-HAS-RETURN', 'usr-1'),
      ).rejects.toThrow('ไม่สามารถกดยอมรับสินค้าได้เนื่องจากมีคำขอคืนสินค้าอยู่ระหว่างดำเนินการ');
    });

    it('idempotently returns completed order if already COMPLETED without duplicate point awards', async () => {
      const mockCompletedOrder = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-ALREADY-DONE',
        userId: 'usr-1',
        status: OrderStatus.COMPLETED,
        completedAt: new Date(),
      });

      prismaMock.order.findUnique.mockResolvedValue(mockCompletedOrder);

      const result = await service.acceptOrder('NIDA-20261017-ALREADY-DONE', 'usr-1');

      expect(prismaMock.order.update).not.toHaveBeenCalled();
      expect(prismaMock.pointTransaction.create).not.toHaveBeenCalled();
      expect(result.status).toBe(OrderStatus.COMPLETED);
    });

    it('allows return request for COMPLETED order within 7 days of delivery', async () => {
      const recentDelivery = new Date(Date.now() - 2 * 86400 * 1000); // 2 days ago
      const mockCompletedOrder = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-RETURN-OK',
        userId: 'usr-1',
        status: OrderStatus.COMPLETED,
        updatedAt: recentDelivery,
        items: [{ id: 'item-1', orderId: 'ord-uuid-1', productName: 'Item 1', quantity: 1, unitPrice: 500 }],
        shipments: [{ id: 'ship-1', status: 'DELIVERED', updatedAt: recentDelivery, logs: [] }],
        returnRequests: [],
      });

      prismaMock.order.findUnique
        .mockResolvedValueOnce(mockCompletedOrder)
        .mockResolvedValueOnce(mockCompletedOrder);

      prismaMock.returnRequest.create.mockResolvedValueOnce({ id: 'ret-1' });

      const result = await service.requestReturn(
        'NIDA-20261017-RETURN-OK',
        {
          reason: 'Size too big',
          items: [{ orderItemId: 'item-1', quantity: 1 }],
        },
        'usr-1',
      );

      expect(prismaMock.returnRequest.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('rejects return request when more than 7 days have passed since delivery', async () => {
      const oldDelivery = new Date(Date.now() - 8 * 86400 * 1000); // 8 days ago
      const mockExpiredOrder = createMockOrderRecord({
        orderNumber: 'NIDA-20261017-EXPIRED',
        userId: 'usr-1',
        status: OrderStatus.COMPLETED,
        updatedAt: oldDelivery,
        items: [{ id: 'item-1', orderId: 'ord-uuid-1', productName: 'Item 1', quantity: 1, unitPrice: 500 }],
        shipments: [{ id: 'ship-1', status: 'DELIVERED', updatedAt: oldDelivery, logs: [] }],
        returnRequests: [],
      });

      prismaMock.order.findUnique.mockResolvedValueOnce(mockExpiredOrder);

      await expect(
        service.requestReturn(
          'NIDA-20261017-EXPIRED',
          {
            reason: 'Size too big',
            items: [{ orderItemId: 'item-1', quantity: 1 }],
          },
          'usr-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
