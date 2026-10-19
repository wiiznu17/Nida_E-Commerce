import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrdersService } from '../../src/modules/orders/orders.service.js';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';

describe('Orders Server Search & Pagination (Admin API)', () => {
  let service: OrdersService;
  let prismaMock: Record<string, unknown>;

  beforeEach(() => {
    prismaMock = {
      order: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'ord-1',
            orderNumber: 'NIDA-20261019-0001',
            status: 'PAID',
            hasPreorderItems: false,
            subtotal: 1000,
            discountTotal: 0,
            shippingFee: 50,
            taxAmount: 0,
            totalAmount: 1050,
            currency: 'THB',
            shippingAddressSnapshot: { recipientName: 'John Doe', phone: '0812345678' },
            placedAt: new Date('2026-10-19T10:00:00Z'),
            items: [],
            payment: { paymentMethod: 'CREDIT_CARD', status: 'SUCCESS' },
            shipments: [],
            refunds: [],
            returnRequests: [],
            cancellationRequests: [],
          },
        ]),
        count: vi.fn().mockResolvedValue(1),
        groupBy: vi.fn().mockResolvedValue([
          { status: 'PAID', _count: { id: 10 } },
          { status: 'PROCESSING', _count: { id: 5 } },
        ]),
      },
      orderCancellationRequest: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'cancel-1',
            requestNumber: 'CAN-001',
            orderId: 'ord-1',
            userId: 'usr-1',
            reason: 'Changed mind',
            status: 'PENDING',
            createdAt: new Date('2026-10-19T10:00:00Z'),
            order: {
              id: 'ord-1',
              orderNumber: 'NIDA-20261019-0001',
              status: 'PAID',
              totalAmount: 1050,
              placedAt: new Date('2026-10-19T09:00:00Z'),
            },
            user: {
              id: 'usr-1',
              email: 'john@example.com',
              firstName: 'John',
              lastName: 'Doe',
            },
          },
        ]),
        count: vi.fn().mockResolvedValue(1),
        groupBy: vi.fn().mockResolvedValue([
          { status: 'PENDING', _count: { id: 1 } },
        ]),
      },
      returnRequest: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'ret-1',
            requestNumber: 'RET-001',
            orderId: 'ord-1',
            userId: 'usr-1',
            reason: 'Defective item',
            status: 'REQUESTED',
            createdAt: new Date('2026-10-19T11:00:00Z'),
            order: {
              id: 'ord-1',
              orderNumber: 'NIDA-20261019-0001',
              status: 'DELIVERED',
              totalAmount: 1050,
              placedAt: new Date('2026-10-19T09:00:00Z'),
            },
            user: {
              id: 'usr-1',
              email: 'john@example.com',
              firstName: 'John',
              lastName: 'Doe',
            },
            items: [
              {
                id: 'ret-item-1',
                orderItemId: 'item-1',
                quantity: 1,
                orderItem: {
                  productNameSnapshot: 'Silk Shirt',
                  variantInfoSnapshot: 'M / Black',
                  unitPrice: 1000,
                },
              },
            ],
          },
        ]),
        count: vi.fn().mockResolvedValue(1),
        groupBy: vi.fn().mockResolvedValue([
          { status: 'REQUESTED', _count: { id: 1 } },
        ]),
      },
    };

    service = new OrdersService(
      prismaMock as unknown as PrismaService,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
  });

  describe('getOrders with server-side query', () => {
    it('returns paginated orders with accurate status counts', async () => {
      const res = await service.getOrders({
        search: 'NIDA',
        status: 'PAID',
        paymentMethod: 'CREDIT_CARD',
        sortBy: 'newest',
        page: 1,
        pageSize: 10,
      });

      expect(res.items).toHaveLength(1);
      expect(res.total).toBe(1);
      expect(res.page).toBe(1);
      expect(res.pageSize).toBe(10);
      expect(res.totalPages).toBe(1);
      expect(res.statusCounts.all).toBe(15);
      expect(res.statusCounts.paid).toBe(10);
      expect(res.statusCounts.processing).toBe(5);
    });

    it('filters by cancellations when status is CANCELLATIONS', async () => {
      await service.getOrders({ status: 'CANCELLATIONS' });
      const findManyMock = (
        prismaMock.order as {
          findMany: { mock: { calls: Array<[Record<string, unknown>]> } };
        }
      ).findMany;
      const findManyCall = findManyMock.mock.calls[0][0];
      expect(findManyCall.where).toMatchObject({
        cancellationRequests: {
          some: { status: 'PENDING' },
        },
      });
    });

    it('filters by returns when status is RETURNS', async () => {
      await service.getOrders({ status: 'RETURNS' });
      const findManyMock = (
        prismaMock.order as {
          findMany: { mock: { calls: Array<[Record<string, unknown>]> } };
        }
      ).findMany;
      const findManyCall = findManyMock.mock.calls[0][0];
      expect(findManyCall.where).toMatchObject({
        returnRequests: {
          some: { status: { in: ['REQUESTED', 'APPROVED'] } },
        },
      });
    });
  });

  describe('getCancellationRequests with server-side query', () => {
    it('returns paginated cancellation requests with status counts and order details', async () => {
      const res = await service.getCancellationRequests({
        search: 'CAN-001',
        status: 'PENDING',
        sortBy: 'newest',
        page: 1,
        pageSize: 10,
      });

      expect(res.items).toHaveLength(1);
      expect(res.items[0].requestNumber).toBe('CAN-001');
      expect(res.items[0].order?.orderNumber).toBe('NIDA-20261019-0001');
      expect(res.items[0].user?.email).toBe('john@example.com');
      expect(res.statusCounts.pending).toBe(1);
    });
  });

  describe('getReturnRequests with server-side query', () => {
    it('returns paginated return requests with snapshot items and order details', async () => {
      const res = await service.getReturnRequests({
        search: 'RET-001',
        status: 'REQUESTED',
        sortBy: 'newest',
        page: 1,
        pageSize: 10,
      });

      expect(res.items).toHaveLength(1);
      expect(res.items[0].requestNumber).toBe('RET-001');
      expect(res.items[0].order?.orderNumber).toBe('NIDA-20261019-0001');
      expect(res.items[0].items[0].productName).toBe('Silk Shirt');
      expect(res.statusCounts.requested).toBe(1);
    });
  });
});
