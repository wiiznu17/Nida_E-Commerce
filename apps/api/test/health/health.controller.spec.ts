import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HealthController } from '../../src/modules/health/health.controller.js';
import { ServiceUnavailableException } from '@nestjs/common';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { RedisService } from '../../src/core/redis/redis.service.js';
import type { MailerService } from '../../src/core/mailer/mailer.service.js';

describe('HealthController (Storefront API Deep Health Check)', () => {
  let controller: HealthController;
  let prismaMock: {
    $queryRaw: ReturnType<typeof vi.fn>;
  };
  let redisMock: {
    ping: ReturnType<typeof vi.fn>;
  };
  let mailerMock: {
    getHealthStatus: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    prismaMock = {
      $queryRaw: vi.fn(),
    };
    redisMock = {
      ping: vi.fn().mockResolvedValue({ status: 'connected', latencyMs: 3 }),
    };
    mailerMock = {
      getHealthStatus: vi
        .fn()
        .mockReturnValue({ status: 'connected', configured: true }),
    };

    controller = new HealthController(
      prismaMock as unknown as PrismaService,
      redisMock as unknown as RedisService,
      mailerMock as unknown as MailerService,
    );
  });

  it('returns healthy status (ok) when database, redis, and mailer are connected', async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ 1: 1 }]);

    const response = await controller.check();

    expect(response.status).toBe('ok');
    expect(response.service).toBe('nida-storefront-api');
    expect(response.services.database.status).toBe('connected');
    expect(response.services.redis.status).toBe('connected');
    expect(response.services.mailer?.status).toBe('connected');
    expect(typeof response.uptimeSeconds).toBe('number');
  });

  it('returns degraded status when mailer service is not configured', async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ 1: 1 }]);
    mailerMock.getHealthStatus.mockReturnValue({
      status: 'degraded',
      configured: false,
      message: 'RESEND_API_KEY missing',
    });

    const response = await controller.check();

    expect(response.status).toBe('degraded');
    expect(response.services.database.status).toBe('connected');
    expect(response.services.mailer?.status).toBe('degraded');
  });

  it('throws ServiceUnavailableException (503) when critical database ping fails', async () => {
    prismaMock.$queryRaw.mockRejectedValue(
      new Error('PostgreSQL connection timeout'),
    );

    await expect(controller.check()).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
