import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LogisticsService } from '../../src/modules/orders/logistics/logistics.service.js';
import { InternalLogisticsProvider } from '../../src/modules/orders/logistics/internal-logistics.provider.js';
import { ShippopLogisticsProvider } from '../../src/modules/orders/logistics/shippop-logistics.provider.js';
import { CarrierMockService } from '../../src/modules/orders/carrier/carrier-mock.service.js';
import { CarrierCode, ShipmentStatus, OrderStatus } from '@repo/types';

describe('LogisticsService', () => {
  let service: LogisticsService;
  let internalProvider: InternalLogisticsProvider;
  let shippopProvider: ShippopLogisticsProvider;
  let prismaMock: Record<string, unknown>;
  let configMock: Record<string, unknown>;

  beforeEach(() => {
    process.env.LOGISTICS_PROVIDER = 'internal';

    const carrierMock = new CarrierMockService();
    internalProvider = new InternalLogisticsProvider(carrierMock);
    shippopProvider = new ShippopLogisticsProvider();

    prismaMock = {
      shipment: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      shipmentLog: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      order: {
        update: vi.fn(),
      },
      $transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) =>
        cb(prismaMock),
      ),
    };

    service = new LogisticsService(
      internalProvider,
      shippopProvider,
      prismaMock as any,
    );
  });

  it('should initialize with internal provider by default', () => {
    expect(service.getActiveProviderName()).toBe('internal');
  });

  it('should switch to shippop provider when LOGISTICS_PROVIDER=shippop', () => {
    process.env.LOGISTICS_PROVIDER = 'shippop';
    const shippopService = new LogisticsService(
      internalProvider,
      shippopProvider,
      prismaMock as any,
    );
    expect(shippopService.getActiveProviderName()).toBe('shippop');
  });

  it('should create a shipment via internal provider', async () => {
    const result = await service.createShipment({
      orderId: 'ord-123',
      orderNumber: 'NIDA-20261016-TEST',
      recipientName: 'K. Nida',
      recipientPhone: '0812345678',
      shippingAddress: {
        addressLine1: '99/1 Sukhumvit',
        subdistrict: 'Klong Tan',
        district: 'Watthana',
        province: 'Bangkok',
        postalCode: '10110',
      },
      carrierCode: CarrierCode.FLASH_EXPRESS,
    });

    expect(result.trackingNumber).toBeDefined();
    expect(result.courierName).toBe('Flash Express');
    expect(result.initialLog.statusTitle).toBeDefined();
  });

  it('should ingest webhook and prevent duplicate log entry', async () => {
    (prismaMock.shipment as any).findFirst.mockResolvedValue({
      id: 'ship-1',
      trackingNumber: 'TH12345678A',
      orderId: 'ord-1',
      order: { id: 'ord-1', status: OrderStatus.SHIPPED },
    });

    // Simulate duplicate existing log
    (prismaMock.shipmentLog as any).findFirst.mockResolvedValue({
      id: 'log-1',
      shipmentId: 'ship-1',
    });

    const res = await service.handleWebhook({
      trackingNumber: 'TH12345678A',
      status: 'DELIVERED',
      title: 'จัดส่งสำเร็จ',
    });

    expect(res.success).toBe(true);
    expect(res.message).toContain('Duplicate');
    expect((prismaMock.shipmentLog as any).create).not.toHaveBeenCalled();
  });

  it('should ingest new webhook and update order to DELIVERED when delivered', async () => {
    (prismaMock.shipment as any).findFirst.mockResolvedValue({
      id: 'ship-1',
      trackingNumber: 'TH12345678A',
      orderId: 'ord-1',
      order: { id: 'ord-1', status: OrderStatus.SHIPPED },
    });

    // No duplicate log
    (prismaMock.shipmentLog as any).findFirst.mockResolvedValue(null);

    const res = await service.handleWebhook({
      trackingNumber: 'TH12345678A',
      status: 'DELIVERED',
      title: 'จัดส่งสำเร็จ',
    });

    expect(res.success).toBe(true);
    expect((prismaMock.shipmentLog as any).create).toHaveBeenCalled();
    expect((prismaMock.order as any).update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ord-1' },
        data: { status: OrderStatus.DELIVERED },
      }),
    );
  });
});
