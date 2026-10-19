import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CustomerAuthService } from '../../src/modules/auth/auth.service.js';
import { BadRequestException, HttpException } from '@nestjs/common';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { RedisService } from '../../src/core/redis/redis.service.js';
import type { MailerService } from '../../src/core/mailer/mailer.service.js';
import type { JwtService } from '@nestjs/jwt';

describe('CustomerAuthService', () => {
  let service: CustomerAuthService;
  let prismaMock: {
    otpVerification: {
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      updateMany: ReturnType<typeof vi.fn>;
    };
    user: {
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };
  let redisMock: {
    checkRateLimit: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    del: ReturnType<typeof vi.fn>;
    ttl: ReturnType<typeof vi.fn>;
  };
  let mailerMock: {
    sendOtpEmail: ReturnType<typeof vi.fn>;
  };
  let jwtMock: {
    sign: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    prismaMock = {
      otpVerification: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };

    redisMock = {
      checkRateLimit: vi
        .fn()
        .mockResolvedValue({ allowed: true, remaining: 2, retryAfter: 60 }),
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      del: vi.fn().mockResolvedValue(undefined),
      ttl: vi.fn().mockResolvedValue(-2),
    };

    mailerMock = {
      sendOtpEmail: vi.fn().mockResolvedValue(undefined),
    };

    jwtMock = {
      sign: vi.fn().mockReturnValue('mock-jwt-token'),
    };

    service = new CustomerAuthService(
      prismaMock as unknown as PrismaService,
      redisMock as unknown as RedisService,
      mailerMock as unknown as MailerService,
      jwtMock as unknown as JwtService,
    );
  });

  describe('requestOtp', () => {
    it('generates a 6-digit OTP, sets 60s cooldown, and sends email when allowed', async () => {
      const email = 'customer@nida.co';
      const result = await service.requestOtp({ email }, '192.168.1.1');

      expect(result.success).toBe(true);
      expect(result.expiresInSeconds).toBe(300);
      expect(redisMock.set).toHaveBeenCalledWith(`otp:cooldown:${email}`, '1', 60);
      expect(mailerMock.sendOtpEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: email,
          otpCode: expect.stringMatching(/^\d{6}$/),
        }),
      );
      expect(prismaMock.otpVerification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email,
            isUsed: false,
          }),
        }),
      );
    });

    it('rejects with 429 when email is in 60-second cooldown', async () => {
      redisMock.get.mockImplementation(async (key: string) => {
        if (key.startsWith('otp:cooldown:')) return '1';
        return null;
      });
      redisMock.ttl.mockResolvedValueOnce(45);

      await expect(
        service.requestOtp({ email: 'cooldown@nida.co' }),
      ).rejects.toThrow(HttpException);
    });

    it('rejects with 429 when account is locked out', async () => {
      redisMock.get.mockImplementation(async (key: string) => {
        if (key.startsWith('otp:lockout:')) return '1';
        return null;
      });
      redisMock.ttl.mockResolvedValueOnce(800);

      await expect(
        service.requestOtp({ email: 'locked@nida.co' }),
      ).rejects.toThrow(HttpException);
    });

    it('throws HttpException with 429 when OTP rate limit is exceeded', async () => {
      redisMock.checkRateLimit.mockResolvedValueOnce({
        allowed: false,
        remaining: 0,
        retryAfter: 120,
      });

      await expect(
        service.requestOtp({ email: 'spam@nida.co' }),
      ).rejects.toThrow(HttpException);
    });

    it('rejects with 429 when IP rate limit is exceeded', async () => {
      redisMock.checkRateLimit.mockImplementation(async (key: string) => {
        if (key.startsWith('otp:ip:')) {
          return { allowed: false, remaining: 0, retryAfter: 900 };
        }
        return { allowed: true, remaining: 2, retryAfter: 300 };
      });

      await expect(
        service.requestOtp({ email: 'client@nida.co' }, '203.0.113.42'),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('verifyOtp', () => {
    it('creates a new user on first verification and clears cooldown/lockout keys', async () => {
      const email = 'newcustomer@nida.co';
      const otpCode = '123456';

      const validRecord = {
        id: 'otp-uuid-1',
        email,
        otpCode,
        attemptsCount: 0,
        isUsed: false,
        expiresAt: new Date(Date.now() + 180_000),
      };

      prismaMock.otpVerification.findFirst.mockResolvedValueOnce(validRecord);
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      prismaMock.user.create.mockResolvedValueOnce({
        id: 'usr-new-1',
        email,
        fullName: null,
        phone: null,
        tier: 'REGULAR',
        points: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await service.verifyOtp({ email, otpCode });

      expect(response.accessToken).toBe('mock-jwt-token');
      expect(response.user.email).toBe(email);
      expect(prismaMock.otpVerification.update).toHaveBeenCalledWith({
        where: { id: 'otp-uuid-1' },
        data: { isUsed: true },
      });
      expect(redisMock.del).toHaveBeenCalledWith(`otp:cooldown:${email}`);
      expect(redisMock.del).toHaveBeenCalledWith(`otp:lockout:${email}`);
    });

    it('locks account in Redis for 15 minutes when 5th failed attempt occurs', async () => {
      const email = 'bruteforce@nida.co';
      const failedRecord = {
        id: 'otp-failed-1',
        email,
        otpCode: '111111',
        attemptsCount: 4, // 5th attempt incoming
        isUsed: false,
        expiresAt: new Date(Date.now() + 180_000),
      };

      prismaMock.otpVerification.findFirst.mockResolvedValueOnce(failedRecord);

      await expect(
        service.verifyOtp({ email, otpCode: '999999' }),
      ).rejects.toThrow(HttpException);

      expect(redisMock.set).toHaveBeenCalledWith(
        `otp:lockout:${email}`,
        '1',
        900,
      );
      expect(prismaMock.otpVerification.update).toHaveBeenCalledWith({
        where: { id: 'otp-failed-1' },
        data: { attemptsCount: 5, isUsed: true },
      });
    });

    it('rejects verification if OTP is expired or not found', async () => {
      prismaMock.otpVerification.findFirst.mockResolvedValueOnce(null);

      await expect(
        service.verifyOtp({ email: 'wrong@nida.co', otpCode: '999999' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
