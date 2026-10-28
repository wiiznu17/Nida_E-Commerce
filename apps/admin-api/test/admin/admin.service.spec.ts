import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminService } from '../../src/modules/admin/admin.service.js';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderStatus, ShipmentStatus, StockChangeType } from '@repo/database';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';

describe('AdminService', () => {
  let service: AdminService;
  let prismaMock: {
    inventoryItem: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      updateMany: ReturnType<typeof vi.fn>;
    };
    stockMovement: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
    order: {
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    shipment: {
      create: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    shipmentLog: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    prismaMock = {
      inventoryItem: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      stockMovement: {
        create: vi.fn(),
        findMany: vi.fn(),
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
      $transaction: vi.fn(async (cb: (tx: unknown) => unknown) =>
        cb(prismaMock),
      ),
    };

    service = new AdminService(prismaMock as unknown as PrismaService);
  });

  describe('restock', () => {
    it('throws BadRequestException if quantity change is zero', async () => {
      await expect(
        service.restock({
          variantId: 'v1',
          quantity: 0,
          reasonNote: 'Zero change',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException if inventory item is not found', async () => {
      prismaMock.inventoryItem.findFirst.mockResolvedValue(null);

      await expect(
        service.restock({
          variantId: 'NON_EXISTENT',
          quantity: 10,
          reasonNote: 'Restock batch',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if negative adjustment causes stock to go below zero', async () => {
      prismaMock.inventoryItem.findFirst.mockResolvedValue({
        id: 'inv-1',
        variantId: 'var-1',
        quantityAvailable: 5,
        variant: {
          skuCode: 'SKU-001',
          product: { category: { department: 'WOMEN' }, images: [] },
        },
      });
      prismaMock.inventoryItem.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        service.restock({
          variantId: 'var-1',
          quantity: -10,
          reasonNote: 'Too much reduction',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(prismaMock.inventoryItem.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'inv-1',
          quantityAvailable: { gte: 10 },
        },
        data: expect.objectContaining({
          quantityAvailable: { decrement: 10 },
        }),
      });
    });

    it('successfully increases stock and creates RESTOCK movement', async () => {
      const mockItem = {
        id: 'inv-1',
        variantId: 'var-1',
        quantityAvailable: 10,
        quantityReserved: 0,
        preorderBooked: 0,
        lowStockThreshold: 5,
        variant: {
          skuCode: 'SKU-001',
          size: 'M',
          colorName: 'Black',
          colorHex: '#000000',
          priceAdjustment: 0,
          product: {
            id: 'prod-1',
            name: 'Classic Coat',
            basePrice: 1500,
            category: { department: 'WOMEN', name: 'Outerwear' },
            images: [],
          },
        },
      };

      prismaMock.inventoryItem.findFirst.mockResolvedValue(mockItem);
      prismaMock.inventoryItem.update.mockResolvedValue({
        ...mockItem,
        quantityAvailable: 25,
      });
      prismaMock.inventoryItem.findUnique.mockResolvedValue({
        ...mockItem,
        quantityAvailable: 25,
      });

      const result = await service.restock({
        variantId: 'inv-1',
        quantity: 15,
        reasonNote: 'Factory restock batch',
      });

      expect(result.quantityAvailable).toBe(25);
      expect(prismaMock.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
        data: expect.objectContaining({
          quantityAvailable: { increment: 15 },
        }),
      });
      expect(prismaMock.stockMovement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          variantId: 'var-1',
          changeType: StockChangeType.RESTOCK,
          quantityChange: 15,
          balanceAfter: 25,
        }),
      });
    });

    it('successfully decreases stock and creates ADJUSTMENT movement', async () => {
      const mockItem = {
        id: 'inv-1',
        variantId: 'var-1',
        quantityAvailable: 20,
        quantityReserved: 0,
        preorderBooked: 0,
        lowStockThreshold: 5,
        variant: {
          skuCode: 'SKU-001',
          size: 'M',
          colorName: 'Black',
          colorHex: '#000000',
          priceAdjustment: 0,
          product: {
            id: 'prod-1',
            name: 'Classic Coat',
            basePrice: 1500,
            category: { department: 'WOMEN', name: 'Outerwear' },
            images: [],
          },
        },
      };

      prismaMock.inventoryItem.findFirst.mockResolvedValue(mockItem);
      prismaMock.inventoryItem.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.inventoryItem.findUnique.mockResolvedValue({
        ...mockItem,
        quantityAvailable: 15,
      });

      const result = await service.restock({
        sku: 'SKU-001',
        variantId: 'SKU-001',
        quantity: -5,
        reasonNote: 'Damaged item audit adjustment',
      });

      expect(result.quantityAvailable).toBe(15);
      expect(prismaMock.inventoryItem.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'inv-1',
          quantityAvailable: { gte: 5 },
        },
        data: expect.objectContaining({
          quantityAvailable: { decrement: 5 },
        }),
      });
      expect(prismaMock.stockMovement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          variantId: 'var-1',
          changeType: StockChangeType.MANUAL_ADJUSTMENT,
          quantityChange: -5,
          balanceAfter: 15,
        }),
      });
    });
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

    it('throws BadRequestException if order is not in PROCESSING status (e.g. PAID or CANCELLED)', async () => {
      prismaMock.order.findFirst.mockResolvedValue({
        id: 'order-1',
        orderNumber: 'NIDA-2026-PAID',
        status: OrderStatus.PAID,
      });

      await expect(
        service.fulfillOrder('NIDA-2026-PAID', {
          courierName: 'Flash Express',
          trackingNumber: 'TH12345678',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates shipment and logs, and sets order status to SHIPPED when order is PROCESSING', async () => {
      prismaMock.order.findFirst.mockResolvedValue({
        id: '11111111-1111-4111-8111-111111111111',
        orderNumber: 'NIDA-2026-PROCESSING',
        status: OrderStatus.PROCESSING,
      });

      prismaMock.shipment.create.mockResolvedValue({
        id: 'ship-1',
        trackingNumber: 'TH999888',
        courierName: 'KEX Express',
        status: ShipmentStatus.LABEL_CREATED,
      });

      const result = await service.fulfillOrder('NIDA-2026-PROCESSING', {
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

  describe('updateShipmentStatus', () => {
    it('throws NotFoundException if shipment does not exist', async () => {
      prismaMock.shipment.findUnique.mockResolvedValue(null);

      await expect(
        service.updateShipmentStatus('non-existent-shipment', {
          status: ShipmentStatus.IN_TRANSIT,
          statusTitle: 'In transit',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if parent order is cancelled', async () => {
      prismaMock.shipment.findUnique.mockResolvedValue({
        id: 'ship-1',
        status: ShipmentStatus.PICKED_UP,
        order: { id: 'ord-1', status: OrderStatus.CANCELLED },
      });

      await expect(
        service.updateShipmentStatus('ship-1', {
          status: ShipmentStatus.IN_TRANSIT,
          statusTitle: 'In transit',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if attempting to revert an already DELIVERED shipment', async () => {
      prismaMock.shipment.findUnique.mockResolvedValue({
        id: 'ship-1',
        status: ShipmentStatus.DELIVERED,
        order: { id: 'ord-1', status: OrderStatus.DELIVERED },
      });

      await expect(
        service.updateShipmentStatus('ship-1', {
          status: ShipmentStatus.PICKED_UP,
          statusTitle: 'Reverting to picked up',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if attempting to skip forward milestones (e.g. LABEL_CREATED to DELIVERED)', async () => {
      prismaMock.shipment.findUnique.mockResolvedValue({
        id: 'ship-1',
        status: ShipmentStatus.LABEL_CREATED,
        order: { id: 'ord-1', status: OrderStatus.SHIPPED },
      });

      await expect(
        service.updateShipmentStatus('ship-1', {
          status: ShipmentStatus.DELIVERED,
          statusTitle: 'Skipping directly to delivered',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('successfully updates shipment and sets order status to DELIVERED when status is DELIVERED', async () => {
      prismaMock.shipment.findUnique.mockResolvedValue({
        id: 'ship-1',
        orderId: 'ord-1',
        status: ShipmentStatus.OUT_FOR_DELIVERY,
        order: { id: 'ord-1', status: OrderStatus.SHIPPED },
      });

      prismaMock.shipment.update.mockResolvedValue({
        id: 'ship-1',
        status: ShipmentStatus.DELIVERED,
        deliveredAt: new Date(),
        logs: [],
      });

      prismaMock.shipmentLog.create.mockResolvedValue({
        id: 'log-1',
        shipmentId: 'ship-1',
        status: ShipmentStatus.DELIVERED,
        statusTitle: 'Delivered to customer',
        logTimestamp: new Date(),
      } as any);

      prismaMock.shipmentLog.findMany.mockResolvedValue([]);

      const result = await service.updateShipmentStatus('ship-1', {
        status: ShipmentStatus.DELIVERED,
        statusTitle: 'Delivered to customer',
      });

      expect(result.status).toBe(ShipmentStatus.DELIVERED);
      expect(prismaMock.order.update).toHaveBeenCalledWith({
        where: { id: 'ord-1' },
        data: { status: OrderStatus.DELIVERED },
      });
    });
  });
});
