import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HealthController } from '../../src/modules/health/health.controller.js';
import { ServiceUnavailableException } from '@nestjs/common';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';

describe('HealthController', () => {
  let controller: HealthController;
  let prismaMock: {
    $queryRaw: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    prismaMock = {
      $queryRaw: vi.fn(),
    };
    controller = new HealthController(prismaMock as unknown as PrismaService);
  });

  it('returns healthy status when database ping succeeds', async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ 1: 1 }]);

    const response = await controller.check();

    expect(response.status).toBe('ok');
    expect(response.database.status).toBe('connected');
    expect(typeof response.uptime).toBe('number');
    expect(typeof response.memory.rssMb).toBe('number');
  });

  it('throws ServiceUnavailableException when database ping fails', async () => {
    prismaMock.$queryRaw.mockRejectedValue(new Error('Connection lost'));

    await expect(controller.check()).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
