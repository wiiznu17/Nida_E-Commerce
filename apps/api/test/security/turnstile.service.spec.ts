import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TurnstileService } from '../../src/core/security/turnstile.service.js';
import { BadRequestException } from '@nestjs/common';

describe('TurnstileService', () => {
  let service: TurnstileService;
  const originalEnv = process.env;

  beforeEach(() => {
    service = new TurnstileService();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('bypasses verification when not in production environment', async () => {
    process.env.NODE_ENV = 'development';
    process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY = 'test-secret';

    const result = await service.verifyToken(undefined);
    expect(result).toBe(true);
  });

  it('bypasses verification when secret key is not set', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

    const result = await service.verifyToken(undefined);
    expect(result).toBe(true);
  });

  it('throws BadRequestException in production when token is missing', async () => {
    process.env.NODE_ENV = 'production';
    process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY = 'test-secret';

    await expect(service.verifyToken('')).rejects.toThrow(BadRequestException);
  });

  it('successfully verifies with Cloudflare API when valid token is provided', async () => {
    process.env.NODE_ENV = 'production';
    process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY = '0x4AAAAAAtest-secret';

    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ success: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await service.verifyToken('valid-token', '192.168.1.1');
    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('throws BadRequestException when Cloudflare rejects the token', async () => {
    process.env.NODE_ENV = 'production';
    process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY = '0x4AAAAAAtest-secret';

    const fetchMock = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        success: false,
        'error-codes': ['invalid-input-response'],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      service.verifyToken('invalid-bot-token', '192.168.1.1'),
    ).rejects.toThrow(BadRequestException);
  });
});
