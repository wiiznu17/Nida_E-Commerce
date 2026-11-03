import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { Prisma } from '@repo/database';

describe('PrismaService Slow Query Logger', () => {
  let service: PrismaService;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.SLOW_QUERY_THRESHOLD_MS;
    delete process.env.SLOW_QUERY_THRESHOLD_MS;
    warnSpy = vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    service = new PrismaService();
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.SLOW_QUERY_THRESHOLD_MS = originalEnv;
    } else {
      delete process.env.SLOW_QUERY_THRESHOLD_MS;
    }
    warnSpy.mockRestore();
  });

  it('registers query event listener and logs warning when query duration exceeds default threshold (200ms)', async () => {
    let capturedHandler: ((event: Prisma.QueryEvent) => void) | undefined;

    vi.spyOn(service, '$on').mockImplementation(
      (event: unknown, callback: unknown) => {
        if (event === 'query') {
          capturedHandler = callback as (event: Prisma.QueryEvent) => void;
        }
        return service;
      },
    );
    vi.spyOn(service, '$connect').mockResolvedValue(undefined);

    await service.onModuleInit();

    expect(capturedHandler).toBeDefined();

    // Trigger slow query event (320ms > 200ms)
    capturedHandler!({
      timestamp: new Date(),
      query: 'SELECT * FROM "products" WHERE "isActive" = true',
      params: '[]',
      duration: 320,
      target: 'public',
    });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        '[Slow Query Detected] Duration: 320ms (Threshold: 200ms)',
      ),
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'SELECT * FROM "products" WHERE "isActive" = true',
      ),
    );
  });

  it('does not log warning when query duration is within normal threshold (<= 200ms)', async () => {
    let capturedHandler: ((event: Prisma.QueryEvent) => void) | undefined;

    vi.spyOn(service, '$on').mockImplementation(
      (event: unknown, callback: unknown) => {
        if (event === 'query') {
          capturedHandler = callback as (event: Prisma.QueryEvent) => void;
        }
        return service;
      },
    );
    vi.spyOn(service, '$connect').mockResolvedValue(undefined);

    await service.onModuleInit();

    expect(capturedHandler).toBeDefined();

    // Fast query (45ms <= 200ms)
    capturedHandler!({
      timestamp: new Date(),
      query: 'SELECT id, slug FROM "categories"',
      params: '[]',
      duration: 45,
      target: 'public',
    });

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('respects SLOW_QUERY_THRESHOLD_MS environment variable override', async () => {
    process.env.SLOW_QUERY_THRESHOLD_MS = '100';

    let capturedHandler: ((event: Prisma.QueryEvent) => void) | undefined;

    vi.spyOn(service, '$on').mockImplementation(
      (event: unknown, callback: unknown) => {
        if (event === 'query') {
          capturedHandler = callback as (event: Prisma.QueryEvent) => void;
        }
        return service;
      },
    );
    vi.spyOn(service, '$connect').mockResolvedValue(undefined);

    await service.onModuleInit();

    // 150ms is below default (200ms) but above configured 100ms
    capturedHandler!({
      timestamp: new Date(),
      query: 'SELECT count(*) FROM "orders"',
      params: '[]',
      duration: 150,
      target: 'public',
    });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        '[Slow Query Detected] Duration: 150ms (Threshold: 100ms)',
      ),
    );
  });
});
