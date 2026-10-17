import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CustomerOrdersService } from '../../src/modules/orders/orders.service.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderStatus, ReturnStatus, PaymentMethod } from '@repo/database';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { MailerService } from '../../src/core/mailer/mailer.service.js';
import type { OmiseService } from '../../src/modules/orders/omise.service.js';

describe('CustomerOrdersService', () => {
  let service: CustomerOrdersService;
  let prismaMock: unknown;
  let mailerMock: unknown;

  beforeEach(() => {
    prismaMock = {
      productVariant: {
        findMany: vi.fn(),
      },
      promotionCoupon: {
        findUnique: vi.fn(),
      },
      couponRedemption: {
        count: vi.fn(),
      },
      order: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      orderCancellationRequest: {
        create: vi.fn(),
      },
      returnRequest: {
        create: vi.fn(),
      },
      payment: {
        update: vi.fn(),
      },
      $transaction: vi.fn(),
    };

    mailerMock = {
      sendOrderConfirmation: vi.fn().mockResolvedValue(undefined),
    };

    const omiseMock = {
      createPromptPayCharge: vi.fn().mockResolvedValue({
        chargeId: 'chrg_test_mock_promptpay',
        qrDownloadUri: 'https://api.omise.co/qr_mock.svg',
        expiresAt: '2026-10-18T10:00:00Z',
        status: 'pending',
      }),
      createCreditCardCharge: vi.fn().mockResolvedValue({
        chargeId: 'chrg_test_mock_card',
        status: 'successful',
        authorizeUri: null,
        failureCode: null,
        failureMessage: null,
        cardBrand: 'Visa',
        cardLast4: '4242',
      }),
      getCharge: vi.fn().mockResolvedValue({
        id: 'chrg_test_mock',
        status: 'successful',
        paid: true,
      }),
      simulateMarkAsPaid: vi.fn().mockResolvedValue({
        id: 'chrg_test_mock',
        status: 'successful',
        paid: true,
      }),
    };

    service = new CustomerOrdersService(
      prismaMock as PrismaService,
      mailerMock as MailerService,
      omiseMock as unknown as OmiseService,
    );
  });

  describe('createOrder', () => {
    const defaultShipping = {
      recipientName: 'Kallaya W.',
      phone: '0812345678',
      addressLine1: '99/1 Sukhumvit 21',
      subdistrict: 'Khlong Toei Nuea',
      district: 'Watthana',
      province: 'Bangkok',
      postalCode: '10110',
    };

    it('rejects order placement when stock is already below requested quantity', async () => {
      (
        prismaMock as { productVariant: { findMany: ReturnType<typeof vi.fn> } }
      ).productVariant.findMany.mockResolvedValueOnce([
        {
          id: 'var-1',
          skuCode: 'NIDA-DRS-BLK-S',
          colorName: 'Black',
          size: 'S',
          priceAdjustment: 0,
          product: {
            name: 'Silk Evening Dress',
            basePrice: 5000,
            isPreorder: false,
            images: [],
          },
          inventoryItem: {
            id: 'inv-1',
            quantityAvailable: 1, // only 1 in stock
          },
        },
      ]);

      await expect(
        service.createOrder({
          items: [{ variantId: 'var-1', quantity: 2 }], // requested 2
          shippingAddress: defaultShipping,
          paymentMethod: 'PROMPTPAY',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('atomically guards against concurrent race-condition over-ordering', async () => {
      (
        prismaMock as { productVariant: { findMany: ReturnType<typeof vi.fn> } }
      ).productVariant.findMany.mockResolvedValueOnce([
        {
          id: 'var-1',
          skuCode: 'NIDA-DRS-BLK-S',
          colorName: 'Black',
          size: 'S',
          priceAdjustment: 0,
          product: {
            name: 'Silk Evening Dress',
            basePrice: 5000,
            isPreorder: false,
            images: [],
          },
          inventoryItem: {
            id: 'inv-1',
            quantityAvailable: 1,
          },
        },
      ]);

      const txMock = {
        order: {
          create: vi.fn().mockResolvedValue({
            id: 'ord-1',
            orderNumber: 'NIDA-20261014-TEST',
            totalAmount: 5000,
          }),
        },
        orderItem: {
          create: vi.fn().mockResolvedValue({ id: 'item-1' }),
        },
        inventoryItem: {
          // Simulate race condition: updateMany returns count 0 (another concurrent checkout won)
          updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        },
      };

      (
        prismaMock as { $transaction: ReturnType<typeof vi.fn> }
      ).$transaction.mockImplementation(
        async (cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock),
      );

      await expect(
        service.createOrder({
          items: [{ variantId: 'var-1', quantity: 1 }],
          shippingAddress: defaultShipping,
          paymentMethod: 'PROMPTPAY',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('trackOrder', () => {
    it('returns public tracking timeline and carrier details', async () => {
      (
        prismaMock as { order: { findUnique: ReturnType<typeof vi.fn> } }
      ).order.findUnique.mockResolvedValueOnce({
        orderNumber: 'NIDA-20261014-ABCD',
        status: 'SHIPPED',
        placedAt: new Date('2026-10-14T10:00:00Z'),
        shipments: [
          {
            id: 'ship-1',
            courierName: 'FLASH_EXPRESS',
            trackingNumber: 'TH012345678',
            status: 'IN_TRANSIT',
            shippedAt: new Date('2026-10-14T12:00:00Z'),
            estimatedDelivery: new Date('2026-10-15T18:00:00Z'),
            deliveredAt: null,
            logs: [
              {
                id: 'log-1',
                statusTitle: 'รับพัสดุเรียบร้อยแล้ว',
                statusDescription:
                  'พนักงานเข้ารับพัสดุจาก Nida Fulfillment Hub',
                location: 'กรุงเทพฯ',
                logTimestamp: new Date('2026-10-14T12:30:00Z'),
              },
            ],
          },
        ],
      });

      const tracking = await service.trackOrder('NIDA-20261014-ABCD');

      expect(tracking.orderNumber).toBe('NIDA-20261014-ABCD');
      expect(tracking.shipment.trackingNumber).toBe('TH012345678');
      expect(tracking.shipment.status).toBe('IN_TRANSIT');
      expect(tracking.shipment.timeline).toHaveLength(1);
      expect(tracking.shipment.timeline[0].statusTitle).toBe(
        'รับพัสดุเรียบร้อยแล้ว',
      );
    });
  });

  describe('requestCancellation', () => {
    const baseOrder = {
      id: 'ord-100',
      orderNumber: 'NIDA-20261014-CANCEL',
      userId: 'user-123',
      status: OrderStatus.PAID,
      hasPreorderItems: false,
      subtotal: 3500,
      discountTotal: 0,
      shippingFee: 0,
      taxAmount: 0,
      totalAmount: 3500,
      currency: 'THB',
      shippingAddressSnapshot: { recipientName: 'Kallaya W.', phone: '0812345678' },
      promoCodeUsed: null,
      placedAt: new Date('2026-10-14T10:00:00Z'),
      items: [],
      payment: null,
      shipments: [],
      cancellationRequests: [],
      returnRequests: [],
      refunds: [],
    };

    it('successfully submits a cancellation request for a paid order', async () => {
      const orderFindUnique = (
        prismaMock as { order: { findUnique: ReturnType<typeof vi.fn> } }
      ).order.findUnique;

      // 1st call for eligibility check
      orderFindUnique.mockResolvedValueOnce({
        ...baseOrder,
        cancellationRequests: [],
      });

      (
        prismaMock as {
          orderCancellationRequest: { create: ReturnType<typeof vi.fn> };
        }
      ).orderCancellationRequest.create.mockResolvedValueOnce({
        id: 'can-1',
        requestNumber: 'CAN-NIDA-20261014-CANCEL-1',
      });

      // 2nd call from getOrderByNumber
      orderFindUnique.mockResolvedValueOnce({
        ...baseOrder,
        cancellationRequests: [
          {
            id: 'can-1',
            requestNumber: 'CAN-NIDA-20261014-CANCEL-1',
            orderId: 'ord-100',
            userId: 'user-123',
            reason: 'Ordered by mistake',
            customerNote: 'Please cancel immediately',
            adminNote: null,
            status: 'PENDING',
            reviewedAt: null,
            reviewedBy: null,
            createdAt: new Date(),
          },
        ],
      });

      const result = await service.requestCancellation(
        'NIDA-20261014-CANCEL',
        { reason: 'Ordered by mistake', customerNote: 'Please cancel immediately' },
        'user-123',
      );

      expect(result.orderNumber).toBe('NIDA-20261014-CANCEL');
      expect(result.cancellationRequests).toHaveLength(1);
      expect(result.cancellationRequests?.[0].requestNumber).toBe(
        'CAN-NIDA-20261014-CANCEL-1',
      );
    });

    it('rejects cancellation if order status is already SHIPPED or DELIVERED', async () => {
      (
        prismaMock as { order: { findUnique: ReturnType<typeof vi.fn> } }
      ).order.findUnique.mockResolvedValueOnce({
        ...baseOrder,
        status: OrderStatus.SHIPPED,
        cancellationRequests: [],
      });

      await expect(
        service.requestCancellation(
          'NIDA-20261014-CANCEL',
          { reason: 'Too late' },
          'user-123',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects cancellation if a pending cancellation request already exists', async () => {
      (
        prismaMock as { order: { findUnique: ReturnType<typeof vi.fn> } }
      ).order.findUnique.mockResolvedValueOnce({
        ...baseOrder,
        cancellationRequests: [
          {
            id: 'can-old',
            status: 'PENDING',
          },
        ],
      });

      await expect(
        service.requestCancellation(
          'NIDA-20261014-CANCEL',
          { reason: 'Duplicate attempt' },
          'user-123',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException if order does not belong to user', async () => {
      (
        prismaMock as { order: { findUnique: ReturnType<typeof vi.fn> } }
      ).order.findUnique.mockResolvedValueOnce({
        ...baseOrder,
        userId: 'other-user',
      });

      await expect(
        service.requestCancellation(
          'NIDA-20261014-CANCEL',
          { reason: 'Not mine' },
          'user-123',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('requestReturn', () => {
    const baseDeliveredOrder = {
      id: 'ord-200',
      orderNumber: 'NIDA-20261014-RETURN',
      userId: 'user-123',
      status: OrderStatus.DELIVERED,
      hasPreorderItems: false,
      subtotal: 6000,
      discountTotal: 0,
      shippingFee: 0,
      taxAmount: 0,
      totalAmount: 6000,
      currency: 'THB',
      shippingAddressSnapshot: { recipientName: 'Kallaya W.', phone: '0812345678' },
      promoCodeUsed: null,
      placedAt: new Date('2026-10-14T10:00:00Z'),
      items: [
        {
          id: 'item-1',
          variantId: 'var-1',
          productNameSnapshot: 'Silk Dress',
          variantInfoSnapshot: 'Black / S',
          unitPrice: 6000,
          quantity: 2,
          subtotal: 6000,
          discountShare: 0,
          netPrice: 6000,
          isPreorder: false,
          expectedShipDate: null,
        },
      ],
      payment: null,
      shipments: [],
      cancellationRequests: [],
      returnRequests: [],
      refunds: [],
    };

    it('successfully submits a return request for a delivered order', async () => {
      const orderFindUnique = (
        prismaMock as { order: { findUnique: ReturnType<typeof vi.fn> } }
      ).order.findUnique;

      orderFindUnique.mockResolvedValueOnce({
        ...baseDeliveredOrder,
        returnRequests: [],
      });

      (
        prismaMock as { returnRequest: { create: ReturnType<typeof vi.fn> } }
      ).returnRequest.create.mockResolvedValueOnce({
        id: 'ret-1',
        requestNumber: 'RET-NIDA-20261014-RETURN-1',
      });

      orderFindUnique.mockResolvedValueOnce({
        ...baseDeliveredOrder,
        returnRequests: [
          {
            id: 'ret-1',
            requestNumber: 'RET-NIDA-20261014-RETURN-1',
            orderId: 'ord-200',
            userId: 'user-123',
            reason: 'Wrong size',
            customerNote: 'Exchange for M',
            adminNote: null,
            status: ReturnStatus.REQUESTED,
            items: [{ id: 'ri-1', orderItemId: 'item-1', quantity: 1 }],
            reviewedAt: null,
            reviewedBy: null,
            createdAt: new Date(),
          },
        ],
      });

      const result = await service.requestReturn(
        'NIDA-20261014-RETURN',
        {
          reason: 'Wrong size',
          customerNote: 'Exchange for M',
          items: [{ orderItemId: 'item-1', quantity: 1 }],
        },
        'user-123',
      );

      expect(result.orderNumber).toBe('NIDA-20261014-RETURN');
      expect(result.returnRequests).toHaveLength(1);
      expect(result.returnRequests?.[0].requestNumber).toBe(
        'RET-NIDA-20261014-RETURN-1',
      );
    });

    it('rejects return if order status is not DELIVERED', async () => {
      (
        prismaMock as { order: { findUnique: ReturnType<typeof vi.fn> } }
      ).order.findUnique.mockResolvedValueOnce({
        ...baseDeliveredOrder,
        status: OrderStatus.SHIPPED,
      });

      await expect(
        service.requestReturn(
          'NIDA-20261014-RETURN',
          {
            reason: 'Wrong size',
            items: [{ orderItemId: 'item-1', quantity: 1 }],
          },
          'user-123',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects return if requested item quantity exceeds purchased quantity', async () => {
      (
        prismaMock as { order: { findUnique: ReturnType<typeof vi.fn> } }
      ).order.findUnique.mockResolvedValueOnce({
        ...baseDeliveredOrder,
        returnRequests: [],
      });

      await expect(
        service.requestReturn(
          'NIDA-20261014-RETURN',
          {
            reason: 'Wrong size',
            items: [{ orderItemId: 'item-1', quantity: 5 }], // purchased only 2
          },
          'user-123',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects return if an active return request already exists', async () => {
      (
        prismaMock as { order: { findUnique: ReturnType<typeof vi.fn> } }
      ).order.findUnique.mockResolvedValueOnce({
        ...baseDeliveredOrder,
        returnRequests: [
          {
            id: 'ret-active',
            status: ReturnStatus.REQUESTED,
          },
        ],
      });

      await expect(
        service.requestReturn(
          'NIDA-20261014-RETURN',
          {
            reason: 'Another attempt',
            items: [{ orderItemId: 'item-1', quantity: 1 }],
          },
          'user-123',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updatePaymentMethod', () => {
    const basePendingOrder = {
      id: 'ord-300',
      orderNumber: 'NIDA-20261014-PAY',
      userId: 'user-123',
      status: OrderStatus.PENDING,
      hasPreorderItems: false,
      subtotal: 3890,
      discountTotal: 0,
      shippingFee: 0,
      taxAmount: 0,
      totalAmount: 3890,
      currency: 'THB',
      shippingAddressSnapshot: { recipientName: 'Phannida', phone: '0812345678' },
      promoCodeUsed: null,
      placedAt: new Date('2026-10-14T10:00:00Z'),
      items: [],
      payment: {
        id: 'pay-1',
        paymentMethod: PaymentMethod.CREDIT_CARD,
        amount: 3890,
        currency: 'THB',
        status: 'PENDING',
      },
      shipments: [],
      cancellationRequests: [],
      returnRequests: [],
      refunds: [],
    };

    it('successfully switches payment method for a pending order', async () => {
      const orderFindUnique = (
        prismaMock as { order: { findUnique: ReturnType<typeof vi.fn> } }
      ).order.findUnique;

      orderFindUnique.mockResolvedValueOnce(basePendingOrder);
      orderFindUnique.mockResolvedValueOnce({
        ...basePendingOrder,
        payment: {
          ...basePendingOrder.payment,
          paymentMethod: PaymentMethod.PROMPTPAY,
        },
      });

      const result = await service.updatePaymentMethod(
        'NIDA-20261014-PAY',
        PaymentMethod.PROMPTPAY,
        'user-123',
      );

      expect(
        (prismaMock as { payment: { update: ReturnType<typeof vi.fn> } }).payment
          .update,
      ).toHaveBeenCalledWith({
        where: { id: 'pay-1' },
        data: expect.objectContaining({
          paymentMethod: PaymentMethod.PROMPTPAY,
          transactionReference: 'chrg_test_mock_promptpay',
        }),
      });
      expect(result.payment?.paymentMethod).toBe(PaymentMethod.PROMPTPAY);
    });

    it('rejects changing payment method if order is not PENDING', async () => {
      (
        prismaMock as { order: { findUnique: ReturnType<typeof vi.fn> } }
      ).order.findUnique.mockResolvedValueOnce({
        ...basePendingOrder,
        status: OrderStatus.PAID,
      });

      await expect(
        service.updatePaymentMethod(
          'NIDA-20261014-PAY',
          PaymentMethod.PROMPTPAY,
          'user-123',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('payOrder', () => {
    const basePendingOrder = {
      id: 'ord-300',
      orderNumber: 'NIDA-20261014-PAY',
      userId: 'user-123',
      status: OrderStatus.PENDING,
      hasPreorderItems: false,
      subtotal: 3890,
      discountTotal: 0,
      shippingFee: 0,
      taxAmount: 0,
      totalAmount: 3890,
      currency: 'THB',
      shippingAddressSnapshot: { recipientName: 'Phannida', phone: '0812345678' },
      promoCodeUsed: null,
      placedAt: new Date('2026-10-14T10:00:00Z'),
      items: [],
      payment: {
        id: 'pay-1',
        paymentMethod: PaymentMethod.PROMPTPAY,
        amount: 3890,
        currency: 'THB',
        status: 'PENDING',
      },
      shipments: [],
      cancellationRequests: [],
      returnRequests: [],
      refunds: [],
    };

    it('captures payment and updates payment method when payload is provided', async () => {
      const orderFindUnique = (
        prismaMock as { order: { findUnique: ReturnType<typeof vi.fn> } }
      ).order.findUnique;

      orderFindUnique.mockResolvedValueOnce(basePendingOrder);

      const txPaymentUpdate = vi.fn().mockResolvedValue({});
      const txOrderUpdate = vi.fn().mockResolvedValue({});
      (
        prismaMock as { $transaction: ReturnType<typeof vi.fn> }
      ).$transaction.mockImplementation(
        async (cb: (tx: unknown) => Promise<unknown>) =>
          cb({
            payment: { update: txPaymentUpdate },
            order: { update: txOrderUpdate },
          }),
      );

      orderFindUnique.mockResolvedValueOnce({
        ...basePendingOrder,
        status: OrderStatus.PAID,
        payment: {
          ...basePendingOrder.payment,
          paymentMethod: PaymentMethod.CREDIT_CARD,
          status: 'CAPTURED',
          cardLast4: '4242',
          cardBrand: 'Visa',
        },
      });

      const result = await service.payOrder(
        'NIDA-20261014-PAY',
        'user-123',
        {
          paymentMethod: PaymentMethod.CREDIT_CARD,
          cardLast4: '4242',
          cardBrand: 'Visa',
        },
      );

      expect(txPaymentUpdate).toHaveBeenCalledWith({
        where: { id: 'pay-1' },
        data: {
          paymentMethod: PaymentMethod.CREDIT_CARD,
          cardLast4: '4242',
          cardBrand: 'Visa',
          status: 'CAPTURED',
          paidAt: expect.any(Date),
        },
      });
      expect(result.order.status).toBe(OrderStatus.PAID);
    });
  });
});


