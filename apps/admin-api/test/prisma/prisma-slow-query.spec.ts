import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { Prisma } from '@repo/database';

describe('PrismaService Slow Query Logger (Admin API)', () => {
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

    capturedHandler!({
      timestamp: new Date(),
      query: 'SELECT * FROM "admin_audit_logs" ORDER BY "created_at" DESC',
      params: '[]',
      duration: 275,
      target: 'public',
    });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        '[Slow Query Detected] Duration: 275ms (Threshold: 200ms)',
      ),
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM "admin_audit_logs"'),
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

    capturedHandler!({
      timestamp: new Date(),
      query: 'SELECT id, email FROM "admin_users" WHERE id = $1',
      params: '["admin-1"]',
      duration: 35,
      target: 'public',
    });

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('respects SLOW_QUERY_THRESHOLD_MS environment variable override', async () => {
    process.env.SLOW_QUERY_THRESHOLD_MS = '150';

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

    capturedHandler!({
      timestamp: new Date(),
      query: 'SELECT count(*) FROM "orders"',
      params: '[]',
      duration: 180,
      target: 'public',
    });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        '[Slow Query Detected] Duration: 180ms (Threshold: 150ms)',
      ),
    );
  });
});
