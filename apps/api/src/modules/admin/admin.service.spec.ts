import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminService } from './admin.service.js';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderStatus, ShipmentStatus } from '@repo/database';

describe('AdminService', () => {
  let service: AdminService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      inventoryItem: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      stockMovement: {
        create: vi.fn(),
      },
      order: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      shipment: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      shipmentLog: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(prismaMock)),
    };

    service = new AdminService(prismaMock);
  });

  describe('fulfillOrder', () => {
    it('throws NotFoundException if order does not exist', async () => {
      prismaMock.order.findFirst.mockResolvedValue(null);

      await expect(
        service.fulfillOrder('NIDA-NONEXISTENT', {
          courierName: 'Flash Express',
          trackingNumber: 'TH12345678',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if order is already cancelled', async () => {
      prismaMock.order.findFirst.mockResolvedValue({
        id: 'order-1',
        orderNumber: 'NIDA-2026-CANCELLED',
        status: OrderStatus.CANCELLED,
      });

      await expect(
        service.fulfillOrder('NIDA-2026-CANCELLED', {
          courierName: 'Flash Express',
          trackingNumber: 'TH12345678',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates shipment and logs, and sets order status to SHIPPED', async () => {
      prismaMock.order.findFirst.mockResolvedValue({
        id: '11111111-1111-4111-8111-111111111111',
        orderNumber: 'NIDA-2026-PAID',
        status: OrderStatus.PAID,
      });

      prismaMock.shipment.create.mockResolvedValue({
        id: 'ship-1',
        trackingNumber: 'TH999888',
        courierName: 'KEX Express',
        status: ShipmentStatus.LABEL_CREATED,
      });

      const result = await service.fulfillOrder('NIDA-2026-PAID', {
        courierName: 'KEX Express',
        trackingNumber: 'TH999888',
      });

      expect(result.orderStatus).toBe(OrderStatus.SHIPPED);
      expect(result.trackingNumber).toBe('TH999888');
      expect(prismaMock.order.update).toHaveBeenCalledWith({
        where: { id: '11111111-1111-4111-8111-111111111111' },
        data: { status: OrderStatus.SHIPPED },
      });
    });
  });
});
