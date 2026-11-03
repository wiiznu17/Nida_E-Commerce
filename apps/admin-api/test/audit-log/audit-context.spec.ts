import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuditLogService } from '../../src/modules/audit-log/audit-log.service.js';
import { AuditContextService } from '../../src/core/audit-context/audit-context.service.js';
import { AuditActionType } from '@repo/types';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';

describe('AuditContext & Automatic Request Metadata Capture', () => {
  let auditLogService: AuditLogService;
  let auditContextService: AuditContextService;
  let prismaMock: {
    adminAuditLog: {
      create: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prismaMock = {
      adminAuditLog: {
        create: vi.fn(),
      },
    };
    auditContextService = new AuditContextService();
    auditLogService = new AuditLogService(
      prismaMock as unknown as PrismaService,
      auditContextService,
    );
  });

  it('automatically populates ipAddress and userAgent from AsyncLocalStorage when omitted in recordLog params', async () => {
    const mockCreatedLog = {
      id: 'log-1',
      adminId: 'admin-ctx-1',
      actionType: AuditActionType.CREATE,
      targetTable: 'products',
      targetId: 'prod-123',
      permission: 'CATALOG_MANAGE',
      performedRole: 'SUPER_ADMIN',
      oldValuesJson: null,
      newValuesJson: { name: 'Polo' },
      ipAddress: '203.0.113.195',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      createdAt: new Date(),
      admin: null,
    };
    prismaMock.adminAuditLog.create.mockResolvedValue(mockCreatedLog);

    await auditContextService.run(
      {
        ipAddress: '203.0.113.195',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        adminId: 'admin-ctx-1',
      },
      async () => {
        // Calling recordLog without explicit ipAddress, userAgent, or adminId
        const result = await auditLogService.recordLog({
          actionType: AuditActionType.CREATE,
          targetTable: 'products',
          targetId: 'prod-123',
          permission: 'CATALOG_MANAGE',
          performedRole: 'SUPER_ADMIN',
          newValuesJson: { name: 'Polo' },
        });

        expect(result).toBeDefined();
        expect(prismaMock.adminAuditLog.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              adminId: 'admin-ctx-1',
              ipAddress: '203.0.113.195',
              userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            }),
          }),
        );
      },
    );
  });

  it('prefers explicitly provided ipAddress and userAgent over AsyncLocalStorage context', async () => {
    prismaMock.adminAuditLog.create.mockResolvedValue({
      id: 'log-2',
      adminId: 'admin-override',
      actionType: AuditActionType.UPDATE,
      targetTable: 'categories',
      targetId: 'cat-1',
      permission: null,
      performedRole: null,
      oldValuesJson: null,
      newValuesJson: null,
      ipAddress: '198.51.100.22',
      userAgent: 'Custom-API-Client/1.0',
      createdAt: new Date(),
      admin: null,
    });

    await auditContextService.run(
      {
        ipAddress: '203.0.113.195',
        userAgent: 'Mozilla/5.0 Browser',
        adminId: 'admin-ctx-1',
      },
      async () => {
        await auditLogService.recordLog({
          adminId: 'admin-override',
          ipAddress: '198.51.100.22',
          userAgent: 'Custom-API-Client/1.0',
          actionType: AuditActionType.UPDATE,
          targetTable: 'categories',
          targetId: 'cat-1',
        });

        expect(prismaMock.adminAuditLog.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              adminId: 'admin-override',
              ipAddress: '198.51.100.22',
              userAgent: 'Custom-API-Client/1.0',
            }),
          }),
        );
      },
    );
  });
});
