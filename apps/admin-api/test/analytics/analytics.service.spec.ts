import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Department, OrderStatus, RefundStatus } from '@repo/database';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { RedisService } from '../../src/core/redis/redis.service.js';
import { AnalyticsService } from '../../src/modules/analytics/analytics.service.js';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prismaMock: {
    order: {
      findMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
    };
    refund: {
      findMany: ReturnType<typeof vi.fn>;
    };
    orderItem: {
      findMany: ReturnType<typeof vi.fn>;
    };
    inventoryItem: {
      count: ReturnType<typeof vi.fn>;
    };
    cart: {
      count: ReturnType<typeof vi.fn>;
    };
    product: {
      findMany: ReturnType<typeof vi.fn>;
    };
    productVariant: {
      findMany: ReturnType<typeof vi.fn>;
    };
    couponRedemption: {
      findMany: ReturnType<typeof vi.fn>;
    };
    adminAuditLog: {
      findMany: ReturnType<typeof vi.fn>;
    };
  };

  let redisMock: {
    cacheGet: ReturnType<typeof vi.fn>;
    cacheSet: ReturnType<typeof vi.fn>;
    cacheDelByPattern: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    prismaMock = {
      order: {
        findMany: vi.fn(),
        count: vi.fn(),
      },
      refund: {
        findMany: vi.fn(),
      },
      orderItem: {
        findMany: vi.fn(),
      },
      inventoryItem: {
        count: vi.fn(),
      },
      cart: {
        count: vi.fn(),
      },
      product: {
        findMany: vi.fn(),
      },
      productVariant: {
        findMany: vi.fn(),
      },
      couponRedemption: {
        findMany: vi.fn(),
      },
      adminAuditLog: {
        findMany: vi.fn(),
      },
    };

    redisMock = {
      cacheGet: vi.fn().mockResolvedValue(null),
      cacheSet: vi.fn().mockResolvedValue(undefined),
      cacheDelByPattern: vi.fn().mockResolvedValue(undefined),
    };

    service = new AnalyticsService(
      prismaMock as unknown as PrismaService,
      redisMock as unknown as RedisService,
    );
  });

  describe('getOverview', () => {
    it('returns cached overview on cache hit without querying database', async () => {
      const mockCached = {
        netRevenue: 50000,
        grossRevenue: 52000,
        totalDiscounts: 2000,
        totalRefunds: 0,
        revenueTrendPct: 15.2,
        totalOrders: 20,
        completedOrders: 18,
        ordersTrendPct: 10,
        fulfillmentRate: 98,
        averageFulfillmentHours: 3.5,
        aov: 2500,
        aovTrendPct: 4.8,
        returningCustomerPct: 40,
        newCustomerPct: 60,
        conversionRate: 3.4,
        cartAbandonmentRate: 67.2,
        returnRate: 0,
        pendingShipmentCount: 2,
        lowStockCount: 1,
        activeShoppersCount: 12,
      };

      redisMock.cacheGet.mockResolvedValueOnce(mockCached);

      const result = await service.getOverview({ timeframe: 'month' });

      expect(result).toEqual(mockCached);
      expect(redisMock.cacheGet).toHaveBeenCalledWith('admin:analytics:overview:month');
      expect(prismaMock.order.findMany).not.toHaveBeenCalled();
    });

    it('aggregates live database data and caches result on cache miss', async () => {
      redisMock.cacheGet.mockResolvedValueOnce(null);

      const placedDate = new Date('2026-10-10T10:00:00.000Z');
      const shippedDate = new Date('2026-10-10T14:00:00.000Z');

      prismaMock.order.findMany
        .mockResolvedValueOnce([
          {
            id: 'ord-1',
            subtotal: 3000,
            discountTotal: 300,
            totalAmount: 2700,
            status: OrderStatus.DELIVERED,
            userId: 'user-1',
            placedAt: placedDate,
            shipments: [{ shippedAt: shippedDate }],
            returnRequests: [],
          },
          {
            id: 'ord-2',
            subtotal: 5000,
            discountTotal: 500,
            totalAmount: 4500,
            status: OrderStatus.COMPLETED,
            userId: 'user-1',
            placedAt: placedDate,
            shipments: [{ shippedAt: shippedDate }],
            returnRequests: [],
          },
        ])
        .mockResolvedValueOnce([
          { totalAmount: 5000 },
        ]);

      prismaMock.refund.findMany.mockResolvedValueOnce([
        { amount: 200 },
      ]);
      prismaMock.order.count.mockResolvedValueOnce(3);
      prismaMock.inventoryItem.count.mockResolvedValueOnce(5);
      prismaMock.cart.count.mockResolvedValueOnce(10);

      const result = await service.getOverview({ timeframe: 'month' });

      expect(result.grossRevenue).toBe(8000);
      expect(result.totalDiscounts).toBe(800);
      expect(result.totalRefunds).toBe(200);
      expect(result.netRevenue).toBe(7000);
      expect(result.totalOrders).toBe(2);
      expect(result.completedOrders).toBe(2);
      expect(result.aov).toBe(3500);
      expect(result.revenueTrendPct).toBe(40.0);
      expect(result.pendingShipmentCount).toBe(3);
      expect(result.lowStockCount).toBe(5);
      expect(result.activeShoppersCount).toBe(10);

      expect(redisMock.cacheSet).toHaveBeenCalledWith(
        'admin:analytics:overview:month',
        expect.any(Object),
        900,
      );
    });

    it('bypasses cache when custom date range is provided', async () => {
      prismaMock.order.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      prismaMock.refund.findMany.mockResolvedValueOnce([]);
      prismaMock.order.count.mockResolvedValueOnce(0);
      prismaMock.inventoryItem.count.mockResolvedValueOnce(0);
      prismaMock.cart.count.mockResolvedValueOnce(0);

      const result = await service.getOverview({
        startDate: '2026-09-01',
        endDate: '2026-09-30',
      });

      expect(result.totalOrders).toBe(0);
      expect(result.netRevenue).toBe(0);
      expect(redisMock.cacheGet).not.toHaveBeenCalled();
      expect(redisMock.cacheSet).not.toHaveBeenCalled();
    });

    it('handles zero orders gracefully without division by zero', async () => {
      prismaMock.order.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      prismaMock.refund.findMany.mockResolvedValueOnce([]);
      prismaMock.order.count.mockResolvedValueOnce(0);
      prismaMock.inventoryItem.count.mockResolvedValueOnce(0);
      prismaMock.cart.count.mockResolvedValueOnce(0);

      const result = await service.getOverview({ timeframe: 'today' });

      expect(result.totalOrders).toBe(0);
      expect(result.netRevenue).toBe(0);
      expect(result.aov).toBe(0);
      expect(result.fulfillmentRate).toBe(100);
      expect(result.revenueTrendPct).toBe(0);
    });
  });

  describe('getSalesByDepartment', () => {
    it('aggregates sales across departments and calculates percentages accurately', async () => {
      prismaMock.orderItem.findMany.mockResolvedValueOnce([
        {
          subtotal: 6000,
          quantity: 3,
          variant: {
            product: {
              category: { department: Department.WOMEN },
            },
          },
        },
        {
          subtotal: 4000,
          quantity: 2,
          variant: {
            product: {
              category: { department: Department.MEN },
            },
          },
        },
      ]);

      const result = await service.getSalesByDepartment({ timeframe: 'quarter' });

      expect(result.length).toBe(6);
      const women = result.find((d) => d.department === Department.WOMEN);
      const men = result.find((d) => d.department === Department.MEN);

      expect(women?.revenue).toBe(6000);
      expect(women?.percentage).toBe(60);
      expect(women?.unitsSold).toBe(3);

      expect(men?.revenue).toBe(4000);
      expect(men?.percentage).toBe(40);
      expect(men?.unitsSold).toBe(2);

      expect(redisMock.cacheSet).toHaveBeenCalledWith(
        'admin:analytics:dept:quarter',
        result,
        3600,
      );
    });
  });

  describe('getTopProducts', () => {
    it('ranks products by revenue and respects limit parameter', async () => {
      prismaMock.orderItem.findMany.mockResolvedValueOnce([
        {
          subtotal: 10000,
          quantity: 5,
          variant: {
            id: 'v-1',
            skuCode: 'SKU-001',
            productId: 'p-1',
            inventoryItem: { quantityAvailable: 25 },
            product: {
              id: 'p-1',
              name: 'Silk Shirt',
              images: [{ imageUrl: 'https://cdn.example.com/p1.jpg' }],
            },
          },
        },
        {
          subtotal: 15000,
          quantity: 3,
          variant: {
            id: 'v-2',
            skuCode: 'SKU-002',
            productId: 'p-2',
            inventoryItem: { quantityAvailable: 10 },
            product: {
              id: 'p-2',
              name: 'Wool Coat',
              images: [{ imageUrl: 'https://cdn.example.com/p2.jpg' }],
            },
          },
        },
      ]);

      const result = await service.getTopProducts({ timeframe: 'week', limit: 1 });

      expect(result.length).toBe(1);
      expect(result[0].rank).toBe(1);
      expect(result[0].productName).toBe('Wool Coat');
      expect(result[0].revenue).toBe(15000);
      expect(result[0].unitsSold).toBe(3);
    });
  });

  describe('getSlowMovingProducts', () => {
    it('returns variants with inventory that have no recent sales', async () => {
      const oldSaleDate = new Date('2026-08-01T00:00:00.000Z');

      prismaMock.productVariant.findMany.mockResolvedValueOnce([
        {
          id: 'v-slow-1',
          skuCode: 'SLOW-01',
          productId: 'prod-slow-1',
          product: {
            name: 'Old Linen Pants',
            createdAt: new Date('2026-05-01T00:00:00.000Z'),
            category: { department: Department.WOMEN },
          },
          inventoryItem: { quantityAvailable: 40 },
          orderItems: [
            {
              order: { placedAt: oldSaleDate },
            },
          ],
        },
        {
          id: 'v-never-sold',
          skuCode: 'NEVER-01',
          productId: 'prod-never',
          product: {
            name: 'Never Sold Hat',
            createdAt: new Date('2026-07-01T00:00:00.000Z'),
            category: { department: Department.MEN },
          },
          inventoryItem: { quantityAvailable: 15 },
          orderItems: [],
        },
      ]);

      const result = await service.getSlowMovingProducts({ days: 30, limit: 10 });

      expect(result.length).toBe(2);
      expect(result[0].currentStock).toBeGreaterThan(0);
      expect(result[0].daysSinceLastSale).toBeGreaterThan(30);
      expect(redisMock.cacheSet).toHaveBeenCalledWith(
        'admin:analytics:slow_moving:30:10',
        result,
        3600,
      );
    });
  });

  describe('getCouponRoi', () => {
    it('calculates ROI percentage and aggregates redemptions', async () => {
      prismaMock.couponRedemption.findMany.mockResolvedValueOnce([
        {
          couponId: 'coup-1',
          discountGranted: 500,
          coupon: { id: 'coup-1', code: 'LUXURY20' },
          order: { totalAmount: 2500 },
        },
        {
          couponId: 'coup-1',
          discountGranted: 500,
          coupon: { id: 'coup-1', code: 'LUXURY20' },
          order: { totalAmount: 2500 },
        },
      ]);

      const result = await service.getCouponRoi({ timeframe: 'month' });

      expect(result.totalUsage).toBe(2);
      expect(result.totalDiscount).toBe(1000);
      expect(result.netRevenueGenerated).toBe(5000);
      expect(result.items.length).toBe(1);
      expect(result.items[0].roiPercent).toBe(400); // (5000 - 1000) / 1000 * 100
    });
  });

  describe('CSV Exports', () => {
    it('exportOrders generates CSV with UTF-8 BOM and correct headers', async () => {
      prismaMock.order.findMany.mockResolvedValueOnce([
        {
          orderNumber: 'NIDA-20261010-001',
          placedAt: new Date('2026-10-10T12:00:00.000Z'),
          status: OrderStatus.PAID,
          currency: 'THB',
          subtotal: 5000,
          discountTotal: 500,
          shippingFee: 100,
          totalAmount: 4600,
          shippingAddressSnapshot: { recipientName: 'Somchai, Suk', phone: '0812345678' },
          user: {
            email: 'somchai@example.com',
            firstName: 'Somchai',
            lastName: 'Suk',
            phone: '0812345678',
          },
          payment: { paymentMethod: 'CREDIT_CARD' },
          shipments: [{ courierName: 'KERRY', trackingNumber: 'KRY123' }],
        },
      ]);

      const csv = await service.exportOrders({
        startDate: '2026-10-01',
        endDate: '2026-10-31',
      });

      expect(csv.startsWith('\uFEFF')).toBe(true);
      expect(csv).toContain('Order Number,Placed At,Customer Name');
      expect(csv).toContain('NIDA-20261010-001');
      expect(csv).toContain('Somchai Suk');
      expect(csv).toContain('4600.00');
    });

    it('exportProducts handles products with and without variants', async () => {
      prismaMock.product.findMany.mockResolvedValueOnce([
        {
          id: 'p-1',
          name: 'Classic Silk Shirt, White',
          nameTh: 'เสื้อเชิ้ตผ้าไหมแท้ สีขาว',
          basePrice: 3500,
          originalPrice: 4200,
          isActive: true,
          category: { name: 'Shirts', department: Department.WOMEN },
          variants: [
            {
              skuCode: 'NIDA-SHIRT-W-S',
              inventoryItem: {
                quantityAvailable: 12,
                quantityReserved: 1,
                preorderBooked: 0,
              },
            },
          ],
        },
      ]);

      const csv = await service.exportProducts({});

      expect(csv.startsWith('\uFEFF')).toBe(true);
      expect(csv).toContain('SKU Code,Product Name,Thai Name');
      expect(csv).toContain('"Classic Silk Shirt, White"');
      expect(csv).toContain('NIDA-SHIRT-W-S');
      expect(csv).toContain('3500.00');
    });

    it('exportInventory correctly classifies stock statuses', async () => {
      prismaMock.productVariant.findMany.mockResolvedValueOnce([
        {
          skuCode: 'SKU-LOW',
          colorName: 'Espresso',
          size: 'M',
          product: {
            name: 'Wool Cardigan',
            category: { department: Department.WOMEN },
          },
          inventoryItem: {
            quantityAvailable: 3,
            quantityReserved: 0,
            lowStockThreshold: 5,
          },
        },
        {
          skuCode: 'SKU-OUT',
          colorName: 'Black',
          size: 'L',
          product: {
            name: 'Wool Cardigan',
            category: { department: Department.WOMEN },
          },
          inventoryItem: {
            quantityAvailable: 0,
            quantityReserved: 0,
            lowStockThreshold: 5,
          },
        },
      ]);

      const csvLowOnly = await service.exportInventory({ status: 'low_stock' });

      expect(csvLowOnly).toContain('SKU-LOW');
      expect(csvLowOnly).not.toContain('SKU-OUT');
      expect(csvLowOnly).toContain('LOW_STOCK');
    });

    it('exportAuditLogs formats audit trail and escapes IP address and roles', async () => {
      prismaMock.adminAuditLog.findMany.mockResolvedValueOnce([
        {
          createdAt: new Date('2026-10-10T15:30:00.000Z'),
          actionType: 'UPDATE',
          targetTable: 'products',
          targetId: 'prod-123',
          permission: 'CATALOG_WRITE',
          performedRole: 'SUPER_ADMIN',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 Chrome/120',
          admin: {
            email: 'admin@nida.com',
            fullName: 'Nida Executive',
          },
        },
      ]);

      const csv = await service.exportAuditLogs({
        startDate: '2026-10-01',
        endDate: '2026-10-31',
      });

      expect(csv.startsWith('\uFEFF')).toBe(true);
      expect(csv).toContain('Timestamp,Admin Email,Admin Name');
      expect(csv).toContain('admin@nida.com');
      expect(csv).toContain('SUPER_ADMIN');
      expect(csv).toContain('192.168.1.1');
    });
  });

  describe('invalidateAll', () => {
    it('calls redis cacheDelByPattern with admin:analytics:* pattern', async () => {
      await service.invalidateAll();
      expect(redisMock.cacheDelByPattern).toHaveBeenCalledWith('admin:analytics:*');
    });
  });
});
