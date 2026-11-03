import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HealthController } from '../../src/modules/health/health.controller.js';
import { ServiceUnavailableException } from '@nestjs/common';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { RedisService } from '../../src/core/redis/redis.service.js';
import type { UploadService } from '../../src/modules/upload/upload.service.js';
import type { MailerService } from '../../src/core/mailer/mailer.service.js';

describe('HealthController (Admin API Deep Health Check)', () => {
  let controller: HealthController;
  let prismaMock: {
    $queryRaw: ReturnType<typeof vi.fn>;
  };
  let redisMock: {
    ping: ReturnType<typeof vi.fn>;
  };
  let uploadServiceMock: {
    getHealthStatus: ReturnType<typeof vi.fn>;
  };
  let mailerServiceMock: {
    getHealthStatus: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    prismaMock = {
      $queryRaw: vi.fn(),
    };
    redisMock = {
      ping: vi.fn().mockResolvedValue({ status: 'connected', latencyMs: 5 }),
    };
    uploadServiceMock = {
      getHealthStatus: vi
        .fn()
        .mockReturnValue({ status: 'connected', configured: true }),
    };
    mailerServiceMock = {
      getHealthStatus: vi
        .fn()
        .mockReturnValue({ status: 'connected', configured: true }),
    };

    controller = new HealthController(
      prismaMock as unknown as PrismaService,
      redisMock as unknown as RedisService,
      uploadServiceMock as unknown as UploadService,
      mailerServiceMock as unknown as MailerService,
    );
  });

  it('returns healthy status (ok) when all critical and peripheral services succeed', async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ 1: 1 }]);

    const response = await controller.check();

    expect(response.status).toBe('ok');
    expect(response.service).toBe('nida-admin-api');
    expect(response.services.database.status).toBe('connected');
    expect(response.services.redis.status).toBe('connected');
    expect(response.services.storage?.status).toBe('connected');
    expect(response.services.mailer?.status).toBe('connected');
    expect(typeof response.uptimeSeconds).toBe('number');
    expect(typeof response.memory?.rssMb).toBe('number');
  });

  it('returns degraded status when peripheral service like mailer is not configured', async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ 1: 1 }]);
    mailerServiceMock.getHealthStatus.mockReturnValue({
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
      new Error('PostgreSQL pool connection failed'),
    );

    await expect(controller.check()).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
