import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CustomerOrdersService } from '../../src/modules/orders/orders.service.js';
import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { MailerService } from '../../src/core/mailer/mailer.service.js';

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
      $transaction: vi.fn(),
    };

    mailerMock = {
      sendOrderConfirmation: vi.fn().mockResolvedValue(undefined),
    };

    service = new CustomerOrdersService(
      prismaMock as PrismaService,
      mailerMock as MailerService,
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
});
