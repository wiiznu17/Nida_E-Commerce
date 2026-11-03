import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccountStatus, type ApiUser } from '@repo/types';
import { AccountStatusGuard } from '../../src/modules/auth/guards/account-status.guard.js';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';

describe('AccountStatusGuard', () => {
  let guard: AccountStatusGuard;
  let reflector: Reflector;
  let prismaMock: {
    user: {
      update: ReturnType<typeof vi.fn>;
    };
  };

  const createMockContext = (user?: Partial<ApiUser>): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = new Reflector();
    prismaMock = {
      user: {
        update: vi.fn(),
      },
    };
    guard = new AccountStatusGuard(
      reflector,
      prismaMock as unknown as PrismaService,
    );
  });

  it('allows access when user is not attached (unauthenticated or optional auth)', async () => {
    const context = createMockContext(undefined);
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('allows access when user status is ACTIVE', async () => {
    const user: Partial<ApiUser> = {
      id: 'usr-1',
      email: 'active@nida.co',
      status: AccountStatus.ACTIVE,
    };
    const context = createMockContext(user);
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('rejects with 403 ACCOUNT_SUSPENDED when user is suspended and duration has not expired', async () => {
    const suspendedUntil = new Date(Date.now() + 600_000).toISOString();
    const user: Partial<ApiUser> = {
      id: 'usr-suspended',
      email: 'suspended@nida.co',
      status: AccountStatus.SUSPENDED,
      statusReason: 'Suspicious activities detected',
      suspendedUntil,
    };
    const context = createMockContext(user);

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
    try {
      await guard.canActivate(context);
    } catch (err: unknown) {
      const resp = (err as ForbiddenException).getResponse() as Record<
        string,
        unknown
      >;
      expect(resp['errorCode']).toBe('ACCOUNT_SUSPENDED');
      expect(resp['details']).toMatchObject({
        reason: 'Suspicious activities detected',
        suspendedUntil,
      });
    }
  });

  it('auto-heals and allows access when suspension duration has expired', async () => {
    const expiredSuspendedUntil = new Date(Date.now() - 60_000).toISOString();
    const user: Partial<ApiUser> = {
      id: 'usr-autoheal',
      email: 'autoheal@nida.co',
      status: AccountStatus.SUSPENDED,
      statusReason: 'Previous temporary block',
      suspendedUntil: expiredSuspendedUntil,
    };
    prismaMock.user.update.mockResolvedValueOnce({
      ...user,
      status: AccountStatus.ACTIVE,
    });
    const context = createMockContext(user);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(user.status).toBe(AccountStatus.ACTIVE);
    expect(user.statusReason).toBeNull();
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'usr-autoheal' },
      data: {
        status: AccountStatus.ACTIVE,
        statusReason: null,
        suspendedAt: null,
        suspendedUntil: null,
      },
    });
  });

  it('rejects with 403 ACCOUNT_BANNED when user status is BANNED', async () => {
    const user: Partial<ApiUser> = {
      id: 'usr-banned',
      email: 'banned@nida.co',
      status: AccountStatus.BANNED,
      statusReason: 'Fraudulent transaction history',
    };
    const context = createMockContext(user);

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
    try {
      await guard.canActivate(context);
    } catch (err: unknown) {
      const resp = (err as ForbiddenException).getResponse() as Record<
        string,
        unknown
      >;
      expect(resp['errorCode']).toBe('ACCOUNT_BANNED');
      expect(resp['details']).toMatchObject({
        reason: 'Fraudulent transaction history',
        supportEmail: 'support@nida-apparel.com',
      });
    }
  });

  it('rejects with 403 ACCOUNT_UNVERIFIED when status is PENDING_VERIFICATION and route lacks @AllowPendingVerification', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const user: Partial<ApiUser> = {
      id: 'usr-pending',
      email: 'pending@nida.co',
      status: AccountStatus.PENDING_VERIFICATION,
    };
    const context = createMockContext(user);

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
    try {
      await guard.canActivate(context);
    } catch (err: unknown) {
      const resp = (err as ForbiddenException).getResponse() as Record<
        string,
        unknown
      >;
      expect(resp['errorCode']).toBe('ACCOUNT_UNVERIFIED');
      expect(resp['details']).toMatchObject({
        verifyUrl: '/verify-otp',
      });
    }
  });

  it('allows access when status is PENDING_VERIFICATION and route is decorated with @AllowPendingVerification', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const user: Partial<ApiUser> = {
      id: 'usr-pending',
      email: 'pending@nida.co',
      status: AccountStatus.PENDING_VERIFICATION,
    };
    const context = createMockContext(user);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('rejects with 401 ACCOUNT_DEACTIVATED when user status is INACTIVE', async () => {
    const user: Partial<ApiUser> = {
      id: 'usr-inactive',
      email: 'inactive@nida.co',
      status: AccountStatus.INACTIVE,
    };
    const context = createMockContext(user);

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
    try {
      await guard.canActivate(context);
    } catch (err: unknown) {
      const resp = (err as UnauthorizedException).getResponse() as Record<
        string,
        unknown
      >;
      expect(resp['errorCode']).toBe('ACCOUNT_DEACTIVATED');
    }
  });
});
