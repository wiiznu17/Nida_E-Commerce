import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { CustomerJwtStrategy } from '../../src/modules/auth/strategies/customer-jwt.strategy.js';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { RedisService } from '../../src/core/redis/redis.service.js';
import type { Request } from 'express';

describe('CustomerJwtStrategy (Revocation & Blacklist Guard)', () => {
  let strategy: CustomerJwtStrategy;
  let prismaMock: {
    user: {
      findUnique: ReturnType<typeof vi.fn>;
    };
  };
  let redisMock: {
    isTokenBlacklisted: ReturnType<typeof vi.fn>;
    getUserRevocationTimestamp: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: vi.fn(),
      },
    };
    redisMock = {
      isTokenBlacklisted: vi.fn().mockResolvedValue(false),
      getUserRevocationTimestamp: vi.fn().mockResolvedValue(null),
    };

    strategy = new CustomerJwtStrategy(
      prismaMock as unknown as PrismaService,
      redisMock as unknown as RedisService,
    );
  });

  const mockReq = (authHeader = 'Bearer test-access-token'): Request =>
    ({
      headers: {
        authorization: authHeader,
      },
    }) as unknown as Request;

  it('validates and returns customer profile when token is active and valid', async () => {
    const payload = {
      sub: 'usr-1',
      email: 'customer@nida.co',
      role: 'CUSTOMER' as const,
      iat: 1730000000,
      exp: 1730000900,
    };

    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 'usr-1',
      email: 'customer@nida.co',
      firstName: 'Sirirat',
      lastName: 'W.',
      tier: 'PLATINUM',
      points: 500,
      isVerified: true,
      createdAt: new Date('2026-01-01'),
    });

    const user = await strategy.validate(mockReq(), payload);
    expect(user.id).toBe('usr-1');
    expect(user.fullName).toBe('Sirirat W.');
    expect(redisMock.isTokenBlacklisted).toHaveBeenCalledWith(
      'test-access-token',
    );
  });

  it('rejects with 401 Unauthorized when access token is blacklisted in Redis', async () => {
    redisMock.isTokenBlacklisted.mockResolvedValueOnce(true);

    const payload = {
      sub: 'usr-1',
      email: 'customer@nida.co',
      role: 'CUSTOMER' as const,
      iat: 1730000000,
      exp: 1730000900,
    };

    await expect(strategy.validate(mockReq(), payload)).rejects.toThrow(
      new UnauthorizedException('Token has been revoked'),
    );
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('rejects with 401 Unauthorized when token was issued prior to user logoutAll timestamp', async () => {
    // Token issued at 1730000000, but user clicked Logout All at 1730000100
    redisMock.getUserRevocationTimestamp.mockResolvedValueOnce(1730000100);

    const payload = {
      sub: 'usr-1',
      email: 'customer@nida.co',
      role: 'CUSTOMER' as const,
      iat: 1730000000,
      exp: 1730000900,
    };

    await expect(strategy.validate(mockReq(), payload)).rejects.toThrow(
      new UnauthorizedException(
        'Session has been revoked on all devices. Please login again.',
      ),
    );
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('rejects with 401 Unauthorized when customer does not exist in database', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    const payload = {
      sub: 'deleted-user',
      email: 'ghost@nida.co',
      role: 'CUSTOMER' as const,
      iat: 1730000000,
      exp: 1730000900,
    };

    await expect(strategy.validate(mockReq(), payload)).rejects.toThrow(
      new UnauthorizedException('Customer account not found'),
    );
  });
});
