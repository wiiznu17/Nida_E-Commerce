import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CustomerAuthService } from '../../src/modules/auth/auth.service.js';
import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { RedisService } from '../../src/core/redis/redis.service.js';
import type { MailerService } from '../../src/core/mailer/mailer.service.js';
import type { JwtService } from '@nestjs/jwt';

describe('CustomerAuthService', () => {
  let service: CustomerAuthService;
  let prismaMock: unknown;
  let redisMock: unknown;
  let mailerMock: unknown;
  let jwtMock: unknown;

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
      },
    };

    redisMock = {
      checkRateLimit: vi
        .fn()
        .mockResolvedValue({ allowed: true, remaining: 2, retryAfter: 60 }),
    };

    mailerMock = {
      sendOtpEmail: vi.fn().mockResolvedValue(undefined),
    };

    jwtMock = {
      sign: vi.fn().mockReturnValue('mock-jwt-token'),
    };

    service = new CustomerAuthService(
      prismaMock as PrismaService,
      redisMock as RedisService,
      mailerMock as MailerService,
      jwtMock as JwtService,
    );
  });

  describe('requestOtp', () => {
    it('generates a 6-digit OTP and sends email when rate limit allows', async () => {
      const email = 'customer@nida.co';
      const result = await service.requestOtp({ email });

      expect(result.success).toBe(true);
      expect(result.expiresInSeconds).toBe(300);
      expect(
        (mailerMock as { sendOtpEmail: ReturnType<typeof vi.fn> }).sendOtpEmail,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          to: email,
          otpCode: expect.stringMatching(/^\d{6}$/),
        }),
      );
      expect(
        (
          prismaMock as {
            otpVerification: { create: ReturnType<typeof vi.fn> };
          }
        ).otpVerification.create,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email,
            isUsed: false,
          }),
        }),
      );
    });

    it('throws HttpException with 429 when OTP rate limit is exceeded', async () => {
      (
        redisMock as { checkRateLimit: ReturnType<typeof vi.fn> }
      ).checkRateLimit.mockResolvedValueOnce({
        allowed: false,
        remaining: 0,
        retryAfter: 120,
      });

      await expect(
        service.requestOtp({ email: 'spam@nida.co' }),
      ).rejects.toThrowError();
    });
  });

  describe('verifyOtp', () => {
    it('creates a new user on first verification and returns customer token', async () => {
      const email = 'newcustomer@nida.co';
      const otpCode = '123456';

      const validRecord = {
        id: 'otp-uuid-1',
        email,
        otpCode,
        isUsed: false,
        expiresAt: new Date(Date.now() + 180_000),
      };

      (
        prismaMock as {
          otpVerification: { findFirst: ReturnType<typeof vi.fn> };
        }
      ).otpVerification.findFirst.mockResolvedValueOnce(validRecord);

      (
        prismaMock as { user: { findUnique: ReturnType<typeof vi.fn> } }
      ).user.findUnique.mockResolvedValueOnce(null);

      (
        prismaMock as { user: { create: ReturnType<typeof vi.fn> } }
      ).user.create.mockResolvedValueOnce({
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
      expect(
        (
          prismaMock as {
            otpVerification: { update: ReturnType<typeof vi.fn> };
          }
        ).otpVerification.update,
      ).toHaveBeenCalledWith({
        where: { id: 'otp-uuid-1' },
        data: { isUsed: true },
      });
    });

    it('rejects verification if OTP is expired or incorrect', async () => {
      (
        prismaMock as {
          otpVerification: { findFirst: ReturnType<typeof vi.fn> };
        }
      ).otpVerification.findFirst.mockResolvedValueOnce(null);

      await expect(
        service.verifyOtp({ email: 'wrong@nida.co', otpCode: '999999' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
