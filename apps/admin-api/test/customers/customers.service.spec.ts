import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CustomersService } from '../../src/modules/customers/customers.service.js';
import { NotFoundException } from '@nestjs/common';
import {
  AccountStatus,
  MembershipTier,
  OrderStatus,
  AdminPermission,
  AuditActionType,
} from '@repo/types';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { RedisService } from '../../src/core/redis/redis.service.js';
import type { AuditLogService } from '../../src/modules/audit-log/audit-log.service.js';

describe('CustomersService', () => {
  let service: CustomersService;

  let prismaMock: {
    user: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    order: {
      findMany: ReturnType<typeof vi.fn>;
    };
  };

  let redisMock: {
    revokeAllCustomerSessions: ReturnType<typeof vi.fn>;
    revokeAllUserTokens: ReturnType<typeof vi.fn>;
  };

  let auditLogMock: {
    recordLog: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    prismaMock = {
      user: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
        update: vi.fn(),
      },
      order: {
        findMany: vi.fn(),
      },
    };

    redisMock = {
      revokeAllCustomerSessions: vi.fn().mockResolvedValue(true),
      revokeAllUserTokens: vi.fn().mockResolvedValue(true),
    };

    auditLogMock = {
      recordLog: vi.fn().mockResolvedValue(undefined),
    };

    service = new CustomersService(
      prismaMock as unknown as PrismaService,
      redisMock as unknown as RedisService,
      auditLogMock as unknown as AuditLogService,
    );
  });

  describe('getCustomers', () => {
    it('returns paginated customer items with computed totalSpent and ordersCount', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'alice@example.com',
          phone: '0812345678',
          firstName: 'Alice',
          lastName: 'Smith',
          tier: MembershipTier.VIP_GOLD,
          points: 1500,
          status: AccountStatus.ACTIVE,
          statusReason: null,
          suspendedAt: null,
          suspendedUntil: null,
          createdAt: new Date('2026-01-01'),
          orders: [
            { status: OrderStatus.COMPLETED, totalAmount: 2500 },
            { status: OrderStatus.PROCESSING, totalAmount: 1500 },
            { status: OrderStatus.CANCELLED, totalAmount: 900 },
          ],
        },
      ];

      prismaMock.user.count.mockResolvedValueOnce(1);
      prismaMock.user.findMany.mockResolvedValueOnce(mockUsers);

      const result = await service.getCustomers({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.fullName).toBe('Alice Smith');
      expect(result.items[0]?.ordersCount).toBe(2); // Excludes cancelled
      expect(result.items[0]?.totalSpent).toBe(4000); // 2500 + 1500
    });

    it('filters by status and search keyword', async () => {
      prismaMock.user.count.mockResolvedValueOnce(0);
      prismaMock.user.findMany.mockResolvedValueOnce([]);

      await service.getCustomers({
        page: 1,
        limit: 10,
        status: AccountStatus.SUSPENDED,
        search: 'bob',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: AccountStatus.SUSPENDED,
            OR: expect.arrayContaining([
              { email: { contains: 'bob', mode: 'insensitive' } },
              { phone: { contains: 'bob', mode: 'insensitive' } },
              { firstName: { contains: 'bob', mode: 'insensitive' } },
              { lastName: { contains: 'bob', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });
  });

  describe('getCustomerStats', () => {
    it('returns aggregated metrics across status and VIP tiers', async () => {
      prismaMock.user.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(85) // active
        .mockResolvedValueOnce(10) // suspended
        .mockResolvedValueOnce(5) // banned
        .mockResolvedValueOnce(25); // vip

      const stats = await service.getCustomerStats();

      expect(stats).toEqual({
        total: 100,
        active: 85,
        suspended: 10,
        banned: 5,
        vipCount: 25,
      });
    });
  });

  describe('getCustomerById', () => {
    it('throws NotFoundException when customer does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      await expect(service.getCustomerById('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns full customer profile, addresses, and recent orders', async () => {
      const mockDetail = {
        id: 'user-2',
        email: 'charlie@example.com',
        phone: '0899999999',
        firstName: 'Charlie',
        lastName: 'Brown',
        tier: MembershipTier.PLATINUM,
        points: 5000,
        status: AccountStatus.ACTIVE,
        statusReason: null,
        suspendedAt: null,
        suspendedUntil: null,
        createdAt: new Date('2026-02-01'),
        addresses: [
          {
            id: 'addr-1',
            recipientName: 'Charlie B.',
            phone: '0899999999',
            addressLine1: '123 Sukhumvit Road',
            addressLine2: null,
            subdistrict: 'Khlong Toei',
            district: 'Khlong Toei',
            province: 'Bangkok',
            postalCode: '10110',
            isDefault: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        orders: [
          {
            id: 'order-1',
            orderNumber: 'ORD-1001',
            status: OrderStatus.DELIVERED,
            totalAmount: 3200,
            placedAt: new Date(),
            payment: { status: 'PAID' },
          },
        ],
      };

      prismaMock.user.findUnique.mockResolvedValueOnce(mockDetail);
      prismaMock.order.findMany.mockResolvedValueOnce([
        { status: OrderStatus.DELIVERED, totalAmount: 3200 },
      ]);

      const result = await service.getCustomerById('user-2');

      expect(result.id).toBe('user-2');
      expect(result.addresses).toHaveLength(1);
      expect(result.recentOrders).toHaveLength(1);
      expect(result.recentOrders[0]?.paymentStatus).toBe('PAID');
      expect(result.totalSpent).toBe(3200);
    });
  });

  describe('updateCustomerStatus', () => {
    it('throws NotFoundException if customer does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.updateCustomerStatus('admin-1', 'user-404', {
          status: AccountStatus.SUSPENDED,
          statusReason: 'Bad behavior',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('suspends customer, sets suspension timer, revokes redis sessions and tokens, and logs audit', async () => {
      const existingUser = {
        id: 'cust-1',
        email: 'suspendee@example.com',
        firstName: 'Bad',
        lastName: 'User',
        status: AccountStatus.ACTIVE,
        statusReason: null,
      };

      prismaMock.user.findUnique.mockResolvedValueOnce(existingUser);
      prismaMock.user.update.mockResolvedValueOnce({
        ...existingUser,
        phone: '0811111111',
        tier: MembershipTier.REGULAR,
        points: 0,
        status: AccountStatus.SUSPENDED,
        statusReason: 'Suspected fraud activity',
        suspendedAt: new Date(),
        suspendedUntil: new Date(Date.now() + 120 * 60 * 1000),
        createdAt: new Date(),
        orders: [],
      });

      const result = await service.updateCustomerStatus(
        'admin-1',
        'cust-1',
        {
          status: AccountStatus.SUSPENDED,
          statusReason: 'Suspected fraud activity',
          durationMinutes: 120,
        },
        'SUPER_ADMIN',
      );

      expect(result.status).toBe(AccountStatus.SUSPENDED);
      expect(result.statusReason).toBe('Suspected fraud activity');
      expect(redisMock.revokeAllCustomerSessions).toHaveBeenCalledWith('cust-1');
      expect(redisMock.revokeAllUserTokens).toHaveBeenCalledWith('cust-1');
      expect(auditLogMock.recordLog).toHaveBeenCalledWith(
        expect.objectContaining({
          adminId: 'admin-1',
          actionType: AuditActionType.STATUS_CHANGE,
          targetTable: 'users',
          targetId: 'cust-1',
          permission: AdminPermission.ADMIN_USERS_MANAGE,
        }),
      );
    });

    it('reactivates customer to ACTIVE, clears dates, and does not revoke tokens', async () => {
      const existingUser = {
        id: 'cust-2',
        email: 'reactivated@example.com',
        firstName: 'Good',
        lastName: 'Customer',
        status: AccountStatus.SUSPENDED,
        statusReason: 'Past issue',
      };

      prismaMock.user.findUnique.mockResolvedValueOnce(existingUser);
      prismaMock.user.update.mockResolvedValueOnce({
        ...existingUser,
        phone: null,
        tier: MembershipTier.SILVER,
        points: 200,
        status: AccountStatus.ACTIVE,
        statusReason: 'Manual reactivation by support',
        suspendedAt: null,
        suspendedUntil: null,
        createdAt: new Date(),
        orders: [],
      });

      const result = await service.updateCustomerStatus('admin-1', 'cust-2', {
        status: AccountStatus.ACTIVE,
        statusReason: 'Manual reactivation by support',
      });

      expect(result.status).toBe(AccountStatus.ACTIVE);
      expect(redisMock.revokeAllCustomerSessions).not.toHaveBeenCalled();
      expect(redisMock.revokeAllUserTokens).not.toHaveBeenCalled();
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cust-2' },
          data: {
            status: AccountStatus.ACTIVE,
            statusReason: 'Manual reactivation by support',
            suspendedAt: null,
            suspendedUntil: null,
          },
        }),
      );
    });
  });
});
