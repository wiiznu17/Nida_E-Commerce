import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminUsersService } from '../../src/modules/admin-users/admin-users.service.js';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  AccountStatus,
  AdminPermission,
  AdminRoleCode,
  AuditActionType,
} from '@repo/types';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { RedisService } from '../../src/core/redis/redis.service.js';
import type { MailerService } from '../../src/core/mailer/mailer.service.js';
import type { AuditLogService } from '../../src/modules/audit-log/audit-log.service.js';

describe('AdminUsersService', () => {
  let service: AdminUsersService;

  let prismaMock: {
    adminUser: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    role: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
    };
  };

  let redisMock: {
    setInviteToken: ReturnType<typeof vi.fn>;
    revokeAllUserSessions: ReturnType<typeof vi.fn>;
  };

  let mailerMock: {
    sendAdminInvitation: ReturnType<typeof vi.fn>;
  };

  let auditLogMock: {
    recordLog: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    prismaMock = {
      adminUser: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      role: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
    };

    redisMock = {
      setInviteToken: vi.fn().mockResolvedValue(true),
      revokeAllUserSessions: vi.fn().mockResolvedValue(true),
    };

    mailerMock = {
      sendAdminInvitation: vi.fn().mockResolvedValue({ id: 'msg-1' }),
    };

    auditLogMock = {
      recordLog: vi.fn().mockResolvedValue(undefined),
    };

    service = new AdminUsersService(
      prismaMock as unknown as PrismaService,
      redisMock as unknown as RedisService,
      mailerMock as unknown as MailerService,
      auditLogMock as unknown as AuditLogService,
    );
  });

  describe('updateAccountStatus', () => {
    it('throws BadRequestException if admin attempts to update their own account status', async () => {
      await expect(
        service.updateAccountStatus('admin-1', 'admin-1', {
          status: AccountStatus.SUSPENDED,
          statusReason: 'Testing self suspension',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException if target admin does not exist', async () => {
      prismaMock.adminUser.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.updateAccountStatus('admin-1', 'ghost-admin', {
          status: AccountStatus.SUSPENDED,
          statusReason: 'Target admin not found',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('updates status to SUSPENDED with duration, revokes sessions, and logs audit trail', async () => {
      const mockTarget = {
        id: 'target-1',
        username: 'staff_john',
        email: 'john@nida.co',
        fullName: 'John Staff',
        department: 'Support',
        status: AccountStatus.ACTIVE,
        statusReason: null,
        suspendedAt: null,
        suspendedUntil: null,
        lastLoginAt: null,
        createdAt: new Date(),
        role: {
          id: 'role-1',
          roleCode: AdminRoleCode.ORDER_MANAGER,
          roleName: 'Order Officer',
          description: null,
          rolePermissions: [
            { permission: { permissionCode: AdminPermission.ORDERS_READ } },
          ],
        },
      };

      prismaMock.adminUser.findUnique.mockResolvedValueOnce(mockTarget);
      prismaMock.adminUser.update.mockResolvedValueOnce({
        ...mockTarget,
        status: AccountStatus.SUSPENDED,
        statusReason: 'Policy violation',
        suspendedAt: new Date(),
        suspendedUntil: new Date(Date.now() + 60 * 60 * 1000),
      });

      const result = await service.updateAccountStatus(
        'admin-1',
        'target-1',
        {
          status: AccountStatus.SUSPENDED,
          statusReason: 'Policy violation',
          durationMinutes: 60,
        },
        AdminRoleCode.SUPER_ADMIN,
      );

      expect(result.status).toBe(AccountStatus.SUSPENDED);
      expect(result.statusReason).toBe('Policy violation');
      expect(redisMock.revokeAllUserSessions).toHaveBeenCalledWith('target-1');
      expect(prismaMock.adminUser.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'target-1' },
          data: expect.objectContaining({
            status: AccountStatus.SUSPENDED,
            statusReason: 'Policy violation',
          }),
        }),
      );
      expect(auditLogMock.recordLog).toHaveBeenCalledWith(
        expect.objectContaining({
          adminId: 'admin-1',
          actionType: AuditActionType.STATUS_CHANGE,
          targetId: 'target-1',
          permission: AdminPermission.ADMIN_USERS_MANAGE,
        }),
      );
    });

    it('updates status to BANNED, revokes all sessions, and logs audit', async () => {
      const mockTarget = {
        id: 'target-2',
        username: 'bad_actor',
        email: 'bad@nida.co',
        fullName: 'Bad Actor',
        department: 'Operations',
        status: AccountStatus.ACTIVE,
        statusReason: null,
        suspendedAt: null,
        suspendedUntil: null,
        lastLoginAt: null,
        createdAt: new Date(),
        role: {
          id: 'role-1',
          roleCode: AdminRoleCode.MARKETING_ADMIN,
          roleName: 'Marketing',
          description: null,
          rolePermissions: [],
        },
      };

      prismaMock.adminUser.findUnique.mockResolvedValueOnce(mockTarget);
      prismaMock.adminUser.update.mockResolvedValueOnce({
        ...mockTarget,
        status: AccountStatus.BANNED,
        statusReason: 'Critical security leak',
      });

      const result = await service.updateAccountStatus('admin-1', 'target-2', {
        status: AccountStatus.BANNED,
        statusReason: 'Critical security leak',
      });

      expect(result.status).toBe(AccountStatus.BANNED);
      expect(redisMock.revokeAllUserSessions).toHaveBeenCalledWith('target-2');
    });

    it('reactivates account to ACTIVE and clears suspension dates', async () => {
      const mockTarget = {
        id: 'target-3',
        username: 'reinstated_staff',
        email: 'reinstated@nida.co',
        fullName: 'Reinstated Staff',
        department: 'Operations',
        status: AccountStatus.SUSPENDED,
        statusReason: 'Expired suspension',
        suspendedAt: new Date(Date.now() - 100_000),
        suspendedUntil: new Date(Date.now() - 10_000),
        lastLoginAt: null,
        createdAt: new Date(),
        role: {
          id: 'role-1',
          roleCode: AdminRoleCode.INVENTORY_MANAGER,
          roleName: 'Inventory',
          description: null,
          rolePermissions: [],
        },
      };

      prismaMock.adminUser.findUnique.mockResolvedValueOnce(mockTarget);
      prismaMock.adminUser.update.mockResolvedValueOnce({
        ...mockTarget,
        status: AccountStatus.ACTIVE,
        statusReason: 'Reinstated after review',
        suspendedAt: null,
        suspendedUntil: null,
      });

      const result = await service.updateAccountStatus('admin-1', 'target-3', {
        status: AccountStatus.ACTIVE,
        statusReason: 'Reinstated after review',
      });

      expect(result.status).toBe(AccountStatus.ACTIVE);
      expect(redisMock.revokeAllUserSessions).not.toHaveBeenCalled();
      expect(prismaMock.adminUser.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'target-3' },
          data: {
            status: AccountStatus.ACTIVE,
            statusReason: 'Reinstated after review',
            suspendedAt: null,
            suspendedUntil: null,
          },
        }),
      );
    });
  });

  describe('inviteAdmin', () => {
    const mockRole = {
      id: 'role-mgr-1',
      roleCode: AdminRoleCode.ORDER_MANAGER,
      roleName: 'Order Manager',
      description: 'Manages orders',
      rolePermissions: [
        { permission: { permissionCode: AdminPermission.ORDERS_READ } },
      ],
    };

    it('successfully invites a new admin, stores token in Redis with 24h TTL, and dispatches invitation email', async () => {
      prismaMock.adminUser.findUnique
        .mockResolvedValueOnce(null) // existingUser by email
        .mockResolvedValueOnce(null); // usernameTaken

      prismaMock.role.findUnique.mockResolvedValueOnce(mockRole);

      const createdAdmin = {
        id: 'new-admin-1',
        username: 'alice',
        email: 'alice@nida.co',
        fullName: 'Alice Staff',
        department: 'Operations',
        roleId: mockRole.id,
        status: AccountStatus.PENDING_VERIFICATION,
        passwordHash: 'INVITATION_PENDING',
        statusReason: null,
        suspendedAt: null,
        suspendedUntil: null,
        createdAt: new Date(),
      };
      prismaMock.adminUser.create.mockResolvedValueOnce(createdAdmin);

      const result = await service.inviteAdmin(
        {
          email: 'alice@nida.co',
          fullName: 'Alice Staff',
          roleId: 'role-mgr-1',
          department: 'Operations',
        },
        'super-admin-id',
        AdminRoleCode.SUPER_ADMIN,
      );

      expect(result.adminUser.email).toBe('alice@nida.co');
      expect(result.adminUser.status).toBe(AccountStatus.PENDING_VERIFICATION);
      expect(result.inviteToken).toBeDefined();
      expect(result.inviteLink).toContain('/admin/setup-password?token=');

      // Verify Redis 24-hour expiration (86400 seconds)
      expect(redisMock.setInviteToken).toHaveBeenCalledWith(
        result.inviteToken,
        expect.objectContaining({
          adminId: 'new-admin-1',
          email: 'alice@nida.co',
          fullName: 'Alice Staff',
          roleId: mockRole.id,
          department: 'Operations',
        }),
        86400,
      );

      // Verify MailerService was called
      expect(mailerMock.sendAdminInvitation).toHaveBeenCalledWith({
        to: 'alice@nida.co',
        fullName: 'Alice Staff',
        setupUrl: result.inviteLink,
      });

      // Verify Audit Log
      expect(auditLogMock.recordLog).toHaveBeenCalledWith(
        expect.objectContaining({
          adminId: 'super-admin-id',
          actionType: AuditActionType.CREATE,
          targetTable: 'admin_users',
          targetId: 'new-admin-1',
          permission: AdminPermission.ADMIN_USERS_MANAGE,
          performedRole: AdminRoleCode.SUPER_ADMIN,
        }),
      );
    });

    it('throws ConflictException if email is already registered', async () => {
      prismaMock.adminUser.findUnique.mockResolvedValueOnce({
        id: 'existing-id',
        email: 'existing@nida.co',
      });

      await expect(
        service.inviteAdmin({
          email: 'existing@nida.co',
          fullName: 'Existing User',
          roleId: 'role-1',
        }),
      ).rejects.toThrow(ConflictException);

      expect(redisMock.setInviteToken).not.toHaveBeenCalled();
      expect(mailerMock.sendAdminInvitation).not.toHaveBeenCalled();
    });

    it('throws NotFoundException if selected role does not exist', async () => {
      prismaMock.adminUser.findUnique.mockResolvedValueOnce(null); // not existing user
      prismaMock.role.findUnique.mockResolvedValueOnce(null); // role not found

      await expect(
        service.inviteAdmin({
          email: 'alice@nida.co',
          fullName: 'Alice Staff',
          roleId: 'non-existent-role',
        }),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.adminUser.create).not.toHaveBeenCalled();
      expect(mailerMock.sendAdminInvitation).not.toHaveBeenCalled();
    });
  });
});
