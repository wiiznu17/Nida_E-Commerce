import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../../src/modules/auth/auth.service.js';
import { UnauthorizedException, HttpException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { RedisService } from '../../src/core/redis/redis.service.js';
import type { JwtService } from '@nestjs/jwt';
import type { MailerService } from '../../src/core/mailer/mailer.service.js';
import type { RedisSessionData } from '@repo/types';

describe('AuthService', () => {
  let service: AuthService;

  let prismaMock: {
    adminUser: {
      findFirst: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  let redisMock: {
    checkRateLimit: ReturnType<typeof vi.fn>;
    clearRateLimit: ReturnType<typeof vi.fn>;
    setSession: ReturnType<typeof vi.fn>;
    getSession: ReturnType<typeof vi.fn>;
    deleteSession: ReturnType<typeof vi.fn>;
    addSessionToUser: ReturnType<typeof vi.fn>;
    removeSessionFromUser: ReturnType<typeof vi.fn>;
    revokeAllUserSessions: ReturnType<typeof vi.fn>;
    getInviteToken: ReturnType<typeof vi.fn>;
    deleteInviteToken: ReturnType<typeof vi.fn>;
    setResetToken: ReturnType<typeof vi.fn>;
    getResetToken: ReturnType<typeof vi.fn>;
    deleteResetToken: ReturnType<typeof vi.fn>;
  };

  let jwtMock: {
    signAsync: ReturnType<typeof vi.fn>;
  };

  let mailerMock: {
    sendAdminInvitation: ReturnType<typeof vi.fn>;
    sendPasswordReset: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    prismaMock = {
      adminUser: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    redisMock = {
      checkRateLimit: vi
        .fn()
        .mockResolvedValue({ allowed: true, remaining: 4, retryAfter: 60 }),
      clearRateLimit: vi.fn().mockResolvedValue(undefined),
      setSession: vi.fn().mockResolvedValue(undefined),
      getSession: vi.fn().mockResolvedValue(null),
      deleteSession: vi.fn().mockResolvedValue(undefined),
      addSessionToUser: vi.fn().mockResolvedValue(undefined),
      removeSessionFromUser: vi.fn().mockResolvedValue(undefined),
      revokeAllUserSessions: vi.fn().mockResolvedValue(undefined),
      getInviteToken: vi.fn().mockResolvedValue(null),
      deleteInviteToken: vi.fn().mockResolvedValue(undefined),
      setResetToken: vi.fn().mockResolvedValue(undefined),
      getResetToken: vi.fn().mockResolvedValue(null),
      deleteResetToken: vi.fn().mockResolvedValue(undefined),
    };

    jwtMock = {
      signAsync: vi.fn().mockResolvedValue('mock_jwt_access_token'),
    };

    mailerMock = {
      sendAdminInvitation: vi.fn().mockResolvedValue(undefined),
      sendPasswordReset: vi.fn().mockResolvedValue(undefined),
    };

    service = new AuthService(
      prismaMock as unknown as PrismaService,
      redisMock as unknown as RedisService,
      jwtMock as unknown as JwtService,
      mailerMock as unknown as MailerService,
    );
  });

  describe('login', () => {
    it('should login successfully with valid credentials and store session in Redis', async () => {
      const passwordHash = await bcrypt.hash('admin123', 10);
      const mockAdmin = {
        id: 'admin-uuid-1',
        username: 'superadmin',
        email: 'admin@nida-apparel.com',
        fullName: 'Nida Super Admin',
        department: 'Headquarters',
        passwordHash,
        isActive: true,
        createdAt: new Date(),
        lastLoginAt: null,
        role: {
          id: 'role-uuid-1',
          roleCode: 'SUPER_ADMIN',
          roleName: 'Super Admin',
          description: 'Full access',
          rolePermissions: [
            { permission: { permissionCode: 'CATALOG_WRITE' } },
            { permission: { permissionCode: 'INVENTORY_ADJUST' } },
          ],
        },
      };

      prismaMock.adminUser.findFirst.mockResolvedValue(mockAdmin);
      prismaMock.adminUser.update.mockResolvedValue(mockAdmin);

      const result = await service.login(
        { identifier: 'superadmin', password: 'admin123' },
        { ip: '127.0.0.1', userAgent: 'Chrome on macOS' },
      );

      expect(result.accessToken).toBe('mock_jwt_access_token');
      expect(result.refreshToken).toBeDefined();
      expect(result.admin.username).toBe('superadmin');
      expect(result.admin.role.roleCode).toBe('SUPER_ADMIN');

      expect(redisMock.clearRateLimit).toHaveBeenCalled();
      expect(redisMock.setSession).toHaveBeenCalled();
      expect(redisMock.addSessionToUser).toHaveBeenCalledWith(
        'admin-uuid-1',
        expect.any(String),
      );
      expect(prismaMock.adminUser.update).toHaveBeenCalledWith({
        where: { id: 'admin-uuid-1' },
        data: { lastLoginAt: expect.any(Date) },
      });
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const passwordHash = await bcrypt.hash('correct_password', 10);
      prismaMock.adminUser.findFirst.mockResolvedValue({
        id: 'admin-uuid-1',
        username: 'superadmin',
        passwordHash,
        isActive: true,
        role: { rolePermissions: [] },
      });

      await expect(
        service.login({ identifier: 'superadmin', password: 'wrong_password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user does not exist or is inactive', async () => {
      prismaMock.adminUser.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ identifier: 'unknown_user', password: 'any_password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw HttpException 429 when rate limit is exceeded', async () => {
      redisMock.checkRateLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        retryAfter: 45,
      });

      await expect(
        service.login({ identifier: 'superadmin', password: 'password' }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('refresh', () => {
    it('should rotate token: destroy old session and issue new tokens', async () => {
      const oldToken = 'old-refresh-token';
      const existingSession: RedisSessionData = {
        sessionId: oldToken,
        adminId: 'admin-uuid-1',
        username: 'superadmin',
        fullName: 'Nida Super Admin',
        roleCode: 'SUPER_ADMIN',
        createdAt: new Date().toISOString(),
      };

      redisMock.getSession.mockResolvedValue(existingSession);

      const mockAdmin = {
        id: 'admin-uuid-1',
        username: 'superadmin',
        email: 'admin@nida-apparel.com',
        isActive: true,
        role: {
          id: 'role-uuid-1',
          roleCode: 'SUPER_ADMIN',
          rolePermissions: [],
        },
      };
      prismaMock.adminUser.findUnique.mockResolvedValue(mockAdmin);

      const result = await service.refresh({ refreshToken: oldToken });

      expect(result.accessToken).toBe('mock_jwt_access_token');
      expect(result.refreshToken).toBeDefined();
      expect(result.refreshToken).not.toBe(oldToken);

      expect(redisMock.deleteSession).toHaveBeenCalledWith(oldToken);
      expect(redisMock.removeSessionFromUser).toHaveBeenCalledWith(
        'admin-uuid-1',
        oldToken,
      );
      expect(redisMock.setSession).toHaveBeenCalledWith(
        result.refreshToken,
        expect.any(Object),
        expect.any(Number),
      );
      expect(redisMock.addSessionToUser).toHaveBeenCalledWith(
        'admin-uuid-1',
        result.refreshToken,
      );
    });

    it('should throw UnauthorizedException if refresh token is not found in Redis', async () => {
      redisMock.getSession.mockResolvedValue(null);

      await expect(
        service.refresh({ refreshToken: 'invalid-or-reused-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout & logoutAll', () => {
    it('should delete token from session and user set on logout', async () => {
      await service.logout('test-token', 'admin-uuid-1');

      expect(redisMock.deleteSession).toHaveBeenCalledWith('test-token');
      expect(redisMock.removeSessionFromUser).toHaveBeenCalledWith(
        'admin-uuid-1',
        'test-token',
      );
    });

    it('should revoke all user sessions on logoutAll', async () => {
      await service.logoutAll('admin-uuid-1');

      expect(redisMock.revokeAllUserSessions).toHaveBeenCalledWith(
        'admin-uuid-1',
      );
    });
  });

  describe('setupPassword & resetPassword', () => {
    it('should activate user and set password when setup token is valid', async () => {
      redisMock.getInviteToken.mockResolvedValue({
        adminId: 'admin-uuid-2',
        email: 'newadmin@nida-apparel.com',
        fullName: 'New Admin',
        roleId: 'role-uuid-2',
      });

      prismaMock.adminUser.update.mockResolvedValue({});

      const result = await service.setupPassword({
        token: 'valid-invite-token',
        password: 'secure_password_123',
      });

      expect(result.success).toBe(true);
      expect(prismaMock.adminUser.update).toHaveBeenCalledWith({
        where: { id: 'admin-uuid-2' },
        data: {
          passwordHash: expect.any(String),
          isActive: true,
        },
      });
      expect(redisMock.deleteInviteToken).toHaveBeenCalledWith(
        'valid-invite-token',
      );
    });

    it('should throw BadRequestException if invite token is invalid', async () => {
      redisMock.getInviteToken.mockResolvedValue(null);

      await expect(
        service.setupPassword({
          token: 'expired-token',
          password: 'secure_password_123',
        }),
      ).rejects.toThrow(Error);
    });

    it('should reset password, revoke all active sessions, and consume reset token', async () => {
      redisMock.getResetToken.mockResolvedValue({
        adminId: 'admin-uuid-1',
        email: 'admin@nida-apparel.com',
      });

      prismaMock.adminUser.update.mockResolvedValue({});

      const result = await service.resetPassword({
        token: 'valid-reset-token',
        password: 'new_super_secure_pass',
      });

      expect(result.success).toBe(true);
      expect(prismaMock.adminUser.update).toHaveBeenCalledWith({
        where: { id: 'admin-uuid-1' },
        data: { passwordHash: expect.any(String) },
      });
      expect(redisMock.revokeAllUserSessions).toHaveBeenCalledWith(
        'admin-uuid-1',
      );
      expect(redisMock.deleteResetToken).toHaveBeenCalledWith(
        'valid-reset-token',
      );
    });
  });
});
