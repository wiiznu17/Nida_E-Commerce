import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuditLogService } from '../../src/modules/audit-log/audit-log.service.js';
import { PrismaService } from '../../src/core/prisma/prisma.service.js';
import { AuditActionType } from '@repo/types';
import { NotFoundException } from '@nestjs/common';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let mockPrisma: {
    adminAuditLog: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
      groupBy: ReturnType<typeof vi.fn>;
    };
  };

  const sampleDbAuditLog = {
    id: 'log-101',
    adminId: 'admin-01',
    actionType: 'UPDATE',
    targetTable: 'products',
    targetId: 'prod-001',
    permission: 'CATALOG_WRITE',
    performedRole: 'SUPER_ADMIN',
    oldValuesJson: { name: 'Old Product' },
    newValuesJson: { name: 'New Product' },
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    createdAt: new Date('2026-10-14T10:00:00.000Z'),
    admin: {
      id: 'admin-01',
      email: 'admin@nida.co.th',
      username: 'thanakorn',
      fullName: 'Thanakorn Admin',
      department: 'Headquarters',
      role: {
        roleCode: 'SUPER_ADMIN',
      },
    },
  };

  beforeEach(() => {
    mockPrisma = {
      adminAuditLog: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
        groupBy: vi.fn(),
      },
    };

    service = new AuditLogService(mockPrisma as unknown as PrismaService);
  });

  describe('recordLog', () => {
    it('creates and returns mapped audit log record', async () => {
      mockPrisma.adminAuditLog.create.mockResolvedValue(sampleDbAuditLog);

      const result = await service.recordLog({
        adminId: 'admin-01',
        actionType: AuditActionType.UPDATE,
        targetTable: 'products',
        targetId: 'prod-001',
        permission: 'CATALOG_WRITE',
        performedRole: 'SUPER_ADMIN',
        oldValuesJson: { name: 'Old Product' },
        newValuesJson: { name: 'New Product' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
      expect(result?.id).toBe('log-101');
      expect(result?.admin?.email).toBe('admin@nida.co.th');
      expect(result?.permission).toBe('CATALOG_WRITE');
      expect(result?.actionType).toBe(AuditActionType.UPDATE);
    });

    it('gracefully handles database errors without throwing', async () => {
      mockPrisma.adminAuditLog.create.mockRejectedValue(
        new Error('DB failure'),
      );

      const result = await service.recordLog({
        actionType: AuditActionType.CREATE,
        targetTable: 'orders',
        targetId: 'ord-123',
      });

      expect(result).toBeNull();
    });
  });

  describe('getAuditLogs', () => {
    it('returns paginated audit logs with metadata', async () => {
      mockPrisma.adminAuditLog.count.mockResolvedValue(1);
      mockPrisma.adminAuditLog.findMany.mockResolvedValue([sampleDbAuditLog]);

      const result = await service.getAuditLogs({
        page: 1,
        limit: 10,
        targetTable: 'products',
        actionType: AuditActionType.UPDATE,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.data[0].targetTable).toBe('products');
    });

    it('applies search filters across targetId, table, and admin info', async () => {
      mockPrisma.adminAuditLog.count.mockResolvedValue(0);
      mockPrisma.adminAuditLog.findMany.mockResolvedValue([]);

      await service.getAuditLogs({
        search: 'Thanakorn',
      });

      expect(mockPrisma.adminAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                admin: expect.objectContaining({
                  OR: expect.any(Array),
                }),
              }),
            ]),
          }),
        }),
      );
    });
  });

  describe('getAuditLogById', () => {
    it('returns single audit log item when found', async () => {
      mockPrisma.adminAuditLog.findUnique.mockResolvedValue(sampleDbAuditLog);

      const result = await service.getAuditLogById('log-101');
      expect(result.id).toBe('log-101');
      expect(result.admin?.fullName).toBe('Thanakorn Admin');
    });

    it('throws NotFoundException when audit log does not exist', async () => {
      mockPrisma.adminAuditLog.findUnique.mockResolvedValue(null);

      await expect(service.getAuditLogById('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAuditLogStats', () => {
    it('returns aggregated audit log statistics', async () => {
      mockPrisma.adminAuditLog.count
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(12);

      mockPrisma.adminAuditLog.groupBy
        .mockResolvedValueOnce([
          { actionType: 'UPDATE', _count: { actionType: 30 } },
        ])
        .mockResolvedValueOnce([
          { targetTable: 'products', _count: { targetTable: 25 } },
        ]);

      const stats = await service.getAuditLogStats();

      expect(stats.totalLogs).toBe(50);
      expect(stats.todayLogs).toBe(12);
      expect(stats.topActionType).toBe('UPDATE');
      expect(stats.topTargetTable).toBe('products');
    });
  });
});
