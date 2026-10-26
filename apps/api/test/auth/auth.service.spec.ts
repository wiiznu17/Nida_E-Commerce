import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CustomerAuthService } from '../../src/modules/auth/auth.service.js';
import {
  BadRequestException,
  HttpException,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
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
    setCustomerSession: ReturnType<typeof vi.fn>;
    getCustomerSession: ReturnType<typeof vi.fn>;
    deleteCustomerSession: ReturnType<typeof vi.fn>;
    addCustomerSession: ReturnType<typeof vi.fn>;
    removeCustomerSession: ReturnType<typeof vi.fn>;
    getCustomerSessions: ReturnType<typeof vi.fn>;
    revokeAllCustomerSessions: ReturnType<typeof vi.fn>;
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
      setCustomerSession: vi.fn().mockResolvedValue(undefined),
      getCustomerSession: vi.fn().mockResolvedValue(null),
      deleteCustomerSession: vi.fn().mockResolvedValue(undefined),
      addCustomerSession: vi.fn().mockResolvedValue(undefined),
      removeCustomerSession: vi.fn().mockResolvedValue(undefined),
      getCustomerSessions: vi.fn().mockResolvedValue([]),
      revokeAllCustomerSessions: vi.fn().mockResolvedValue(undefined),
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

  describe('checkEmail', () => {
    it('returns exists: true when customer user exists', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 'usr-1' });
      const res = await service.checkEmail('found@nida.co');
      expect(res.exists).toBe(true);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'found@nida.co' },
        select: { id: true },
      });
    });

    it('returns exists: false when customer user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      const res = await service.checkEmail('notfound@nida.co');
      expect(res.exists).toBe(false);
    });

    it('returns exists: false for invalid or blank email', async () => {
      const res = await service.checkEmail('invalid-email');
      expect(res.exists).toBe(false);
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('requestOtp', () => {
    it('rejects with NotFoundException when signin intent and user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.requestOtp({ email: 'ghost@nida.co', intent: 'signin' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('allows OTP request when signin intent and user exists', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 'usr-1' });

      const res = await service.requestOtp({
        email: 'member@nida.co',
        intent: 'signin',
      });
      expect(res.success).toBe(true);
    });

    it('rejects with ConflictException when signup intent and user already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 'usr-1' });

      await expect(
        service.requestOtp({ email: 'taken@nida.co', intent: 'signup' }),
      ).rejects.toThrow(ConflictException);
    });

    it('allows OTP request when signup intent and user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      const res = await service.requestOtp({
        email: 'newuser@nida.co',
        intent: 'signup',
      });
      expect(res.success).toBe(true);
    });
    it('generates a 6-digit OTP, sets 60s cooldown, and sends email when allowed', async () => {
      const email = 'customer@nida.co';
      const result = await service.requestOtp({ email }, '192.168.1.1');

      expect(result.success).toBe(true);
      expect(result.expiresInSeconds).toBe(300);
      expect(redisMock.set).toHaveBeenCalledWith(
        `otp:cooldown:${email}`,
        '1',
        60,
      );
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

  describe('verifyOtp & Session Tracking', () => {
    it('creates a new user, issues dual tokens, and sets Redis session', async () => {
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
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await service.verifyOtp(
        { email, otpCode },
        { ip: '10.0.0.1', userAgent: 'Mozilla/5.0 Mac' },
      );

      expect(response.accessToken).toBe('mock-jwt-token');
      expect(response.refreshToken).toBeDefined();
      expect(response.tokenType).toBe('Bearer');
      expect(response.expiresIn).toBe(900);
      expect(response.user.email).toBe(email);
      expect(redisMock.setCustomerSession).toHaveBeenCalledWith(
        response.refreshToken,
        expect.objectContaining({
          sessionId: response.refreshToken,
          userId: 'usr-new-1',
          email,
          device: 'Mac',
          ipAddress: '10.0.0.1',
        }),
        604800,
      );
      expect(redisMock.addCustomerSession).toHaveBeenCalledWith(
        'usr-new-1',
        response.refreshToken,
      );
      expect(redisMock.del).toHaveBeenCalledWith(`otp:cooldown:${email}`);
      expect(redisMock.del).toHaveBeenCalledWith(`otp:lockout:${email}`);
    });

    it('locks account in Redis for 15 minutes when 5th failed attempt occurs', async () => {
      const email = 'bruteforce@nida.co';
      const failedRecord = {
        id: 'otp-failed-1',
        email,
        otpCode: '111111',
        attemptsCount: 4,
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

    it('rejects verification with NotFoundException if signin intent and user does not exist', async () => {
      const validRecord = {
        id: 'otp-uuid-2',
        email: 'ghost@nida.co',
        otpCode: '123456',
        attemptsCount: 0,
        isUsed: false,
        expiresAt: new Date(Date.now() + 180_000),
      };

      prismaMock.otpVerification.findFirst.mockResolvedValueOnce(validRecord);
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.verifyOtp({
          email: 'ghost@nida.co',
          otpCode: '123456',
          intent: 'signin',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects verification with BadRequestException if signup intent and user already exists', async () => {
      const validRecord = {
        id: 'otp-uuid-3',
        email: 'taken@nida.co',
        otpCode: '123456',
        attemptsCount: 0,
        isUsed: false,
        expiresAt: new Date(Date.now() + 180_000),
      };

      prismaMock.otpVerification.findFirst.mockResolvedValueOnce(validRecord);
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: 'usr-existing',
        email: 'taken@nida.co',
      });

      await expect(
        service.verifyOtp({
          email: 'taken@nida.co',
          otpCode: '123456',
          intent: 'signup',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('refreshTokens (Token Rotation)', () => {
    it('rotates refresh token and returns fresh access token', async () => {
      const oldRefreshToken = 'old-refresh-uuid';
      const sessionData = {
        sessionId: oldRefreshToken,
        userId: 'usr-1',
        email: 'user@nida.co',
        device: 'Mac',
        createdAt: new Date().toISOString(),
      };

      redisMock.getCustomerSession.mockResolvedValueOnce(sessionData);
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: 'usr-1',
        email: 'user@nida.co',
      });

      const result = await service.refreshTokens({
        refreshToken: oldRefreshToken,
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBeDefined();
      expect(result.refreshToken).not.toBe(oldRefreshToken);
      expect(redisMock.deleteCustomerSession).toHaveBeenCalledWith(
        oldRefreshToken,
      );
      expect(redisMock.removeCustomerSession).toHaveBeenCalledWith(
        'usr-1',
        oldRefreshToken,
      );
      expect(redisMock.setCustomerSession).toHaveBeenCalledWith(
        result.refreshToken,
        expect.objectContaining({
          sessionId: result.refreshToken,
          userId: 'usr-1',
        }),
        604800,
      );
      expect(redisMock.addCustomerSession).toHaveBeenCalledWith(
        'usr-1',
        result.refreshToken,
      );
    });

    it('throws UnauthorizedException if refresh token not found in Redis', async () => {
      redisMock.getCustomerSession.mockResolvedValueOnce(null);

      await expect(
        service.refreshTokens({ refreshToken: 'non-existent' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout & logoutAll', () => {
    it('removes active session from Redis on logout', async () => {
      const token = 'active-session-token';
      redisMock.getCustomerSession.mockResolvedValueOnce({
        sessionId: token,
        userId: 'usr-1',
      });

      const res = await service.logout(token);
      expect(res.success).toBe(true);
      expect(redisMock.deleteCustomerSession).toHaveBeenCalledWith(token);
      expect(redisMock.removeCustomerSession).toHaveBeenCalledWith(
        'usr-1',
        token,
      );
    });

    it('revokes all sessions on logoutAll', async () => {
      const res = await service.logoutAll('usr-1');
      expect(res.success).toBe(true);
      expect(redisMock.revokeAllCustomerSessions).toHaveBeenCalledWith('usr-1');
    });
  });

  describe('updateProfile', () => {
    it('persists name and phone changes to DB', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: 'usr-1',
        email: 'test@nida.co',
      });
      prismaMock.user.update.mockResolvedValueOnce({
        id: 'usr-1',
        email: 'test@nida.co',
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '0899999999',
        tier: 'REGULAR',
        points: 50,
        isVerified: true,
        createdAt: new Date(),
      });

      const updated = await service.updateProfile('usr-1', {
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '0899999999',
      });

      expect(updated.firstName).toBe('Jane');
      expect(updated.fullName).toBe('Jane Doe');
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'usr-1' },
        data: {
          firstName: 'Jane',
          lastName: 'Doe',
          phone: '0899999999',
        },
      });
    });
  });

  describe('Sensitive Email Change Flow', () => {
    it('rejects email change request if new email is identical to current email', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: 'usr-1',
        email: 'same@nida.co',
      });

      await expect(
        service.requestEmailChange('usr-1', { newEmail: 'same@nida.co' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects email change request if new email is already in use by another user', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce({ id: 'usr-1', email: 'user1@nida.co' })
        .mockResolvedValueOnce({ id: 'usr-2', email: 'taken@nida.co' });

      await expect(
        service.requestEmailChange('usr-1', { newEmail: 'taken@nida.co' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('sends OTP and sets cooldown when new email is valid and available', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce({ id: 'usr-1', email: 'user1@nida.co' })
        .mockResolvedValueOnce(null);

      const res = await service.requestEmailChange('usr-1', {
        newEmail: 'fresh@nida.co',
      });

      expect(res.success).toBe(true);
      expect(mailerMock.sendOtpEmail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'fresh@nida.co' }),
      );
      expect(redisMock.set).toHaveBeenCalledWith(
        'otp:cooldown:fresh@nida.co',
        '1',
        60,
      );
    });

    it('verifies OTP, updates user email in DB, and revokes all old sessions for security', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: 'usr-1',
        email: 'old@nida.co',
      });
      prismaMock.otpVerification.findFirst.mockResolvedValueOnce({
        id: 'otp-email-1',
        email: 'fresh@nida.co',
        otpCode: '654321',
        attemptsCount: 0,
        isUsed: false,
        expiresAt: new Date(Date.now() + 180_000),
      });
      prismaMock.user.update.mockResolvedValueOnce({
        id: 'usr-1',
        email: 'fresh@nida.co',
        firstName: 'Jane',
        lastName: 'Doe',
        tier: 'REGULAR',
        points: 0,
        isVerified: true,
        createdAt: new Date(),
      });

      const res = await service.verifyEmailChange(
        'usr-1',
        { newEmail: 'fresh@nida.co', otpCode: '654321' },
        { ip: '192.168.1.5', userAgent: 'Macintosh' },
      );

      expect(res.success).toBe(true);
      expect(res.user.email).toBe('fresh@nida.co');
      expect(redisMock.revokeAllCustomerSessions).toHaveBeenCalledWith('usr-1');
      expect(redisMock.setCustomerSession).toHaveBeenCalled();
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'usr-1' },
        data: { email: 'fresh@nida.co' },
      });
    });
  });
});
