import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { RedisService } from '../../core/redis/redis.service.js';
import { MailerService } from '../../core/mailer/mailer.service.js';
import type {
  RequestOtpResponse,
  VerifyOtpResponse,
  ApiUser,
  CustomerJwtPayload,
} from '@repo/types';
import type { RequestOtpInput, VerifyOtpInput } from '@repo/validators';

@Injectable()
export class CustomerAuthService {
  private readonly logger = new Logger(CustomerAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly mailer: MailerService,
    private readonly jwtService: JwtService,
  ) {}

  async requestOtp(
    dto: RequestOtpInput,
    clientIp?: string,
  ): Promise<RequestOtpResponse> {
    const email = dto.email.trim().toLowerCase();

    // 1. Check if account is temporarily locked out from excessive failed attempts
    const isLocked = await this.redis.get(`otp:lockout:${email}`);
    if (isLocked) {
      const remainingSeconds = await this.redis.ttl(`otp:lockout:${email}`);
      const mins = Math.max(1, Math.ceil(remainingSeconds / 60));
      throw new HttpException(
        `บัญชีนี้ถูกระงับการขอ OTP ชั่วคราวเนื่องจากกรอกรหัสผิดเกินจำนวนครั้ง กรุณารอ ${mins} นาที (Account temporarily locked. Please wait ${mins} minutes.)`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 2. Enforce 60-second cooldown per email
    const inCooldown = await this.redis.get(`otp:cooldown:${email}`);
    if (inCooldown) {
      const remainingCooldown = await this.redis.ttl(`otp:cooldown:${email}`);
      const waitSec = remainingCooldown > 0 ? remainingCooldown : 60;
      throw new HttpException(
        `กรุณารอ ${waitSec} วินาทีก่อนขอรหัส OTP ใหม่อีกครั้ง (Please wait ${waitSec}s before requesting a new OTP)`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 3. Rate limit: Max 3 requests per 5 minutes per email
    const rateLimit = await this.redis.checkRateLimit(`otp:${email}`, 3, 300);
    if (!rateLimit.allowed) {
      throw new HttpException(
        'ขอรหัส OTP ถี่เกินไป กรุณารอ 5 นาทีก่อนลองใหม่อีกครั้ง (Too many OTP requests. Please wait 5 minutes.)',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 4. Rate limit: Max 10 requests per 15 minutes per IP address (bot prevention)
    if (
      clientIp &&
      clientIp !== 'unknown' &&
      clientIp !== '127.0.0.1' &&
      clientIp !== '::1'
    ) {
      const ipRateLimit = await this.redis.checkRateLimit(
        `otp:ip:${clientIp}`,
        10,
        900,
      );
      if (!ipRateLimit.allowed) {
        throw new HttpException(
          'มีคำขอรหัส OTP จาก IP นี้มากเกินไป กรุณารอ 15 นาที (Too many OTP requests from this IP address. Please wait 15 minutes.)',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    await this.prisma.otpVerification.updateMany({
      where: { email, isUsed: false },
      data: { isUsed: true },
    });

    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresInSeconds = 300;
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    await this.prisma.otpVerification.create({
      data: {
        email,
        otpCode,
        expiresAt,
        isUsed: false,
        attemptsCount: 0,
      },
    });

    // 5. Set 60-second cooldown key in Redis
    await this.redis.set(`otp:cooldown:${email}`, '1', 60);

    await this.mailer.sendOtpEmail({ to: email, otpCode });

    this.logger.log(
      `OTP generated and dispatched for customer email: ${email}`,
    );

    const isDev = process.env.NODE_ENV !== 'production';

    return {
      success: true,
      message: 'รหัส OTP ถูกส่งไปยังอีเมลเรียบร้อยแล้ว (OTP sent successfully)',
      expiresInSeconds,
      ...(isDev ? { devOtpCode: otpCode } : {}),
    };
  }

  async verifyOtp(dto: VerifyOtpInput): Promise<VerifyOtpResponse> {
    const email = dto.email.trim().toLowerCase();
    const otpCode = dto.otpCode.trim();

    // 1. Check if account is temporarily locked out
    const isLocked = await this.redis.get(`otp:lockout:${email}`);
    if (isLocked) {
      const remainingSeconds = await this.redis.ttl(`otp:lockout:${email}`);
      const mins = Math.max(1, Math.ceil(remainingSeconds / 60));
      throw new HttpException(
        `บัญชีนี้ถูกระงับการตรวจสอบ OTP ชั่วคราวเนื่องจากกรอกรหัสผิดเกินจำนวนครั้ง กรุณารอ ${mins} นาที (Account temporarily locked. Please wait ${mins} minutes.)`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const otpRecord = await this.prisma.otpVerification.findFirst({
      where: {
        email,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException(
        'รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอรหัสใหม่ (Invalid or expired OTP code)',
      );
    }

    if (otpRecord.attemptsCount >= 5) {
      await this.prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });
      await this.redis.set(`otp:lockout:${email}`, '1', 900);
      throw new HttpException(
        'กรอกรหัสผิดเกินจำนวนครั้งที่กำหนด บัญชีถูกระงับชั่วคราว 15 นาทีเพื่อความปลอดภัย (Too many failed attempts. Account locked for 15 minutes.)',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (otpRecord.otpCode !== otpCode) {
      const nextAttempts = otpRecord.attemptsCount + 1;
      await this.prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: {
          attemptsCount: nextAttempts,
          isUsed: nextAttempts >= 5,
        },
      });

      if (nextAttempts >= 5) {
        await this.redis.set(`otp:lockout:${email}`, '1', 900);
        throw new HttpException(
          'กรอกรหัสผิดเกิน 5 ครั้ง บัญชีนี้ถูกระงับชั่วคราว 15 นาทีเพื่อความปลอดภัย (Too many failed attempts. Account locked for 15 minutes.)',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      const remainingTries = 5 - nextAttempts;
      throw new BadRequestException(
        `รหัส OTP ไม่ถูกต้อง (เหลือโอกาสอีก ${remainingTries} ครั้ง)`,
      );
    }

    await this.prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // Clear cooldown and lockout keys on successful verification
    await this.redis.del(`otp:cooldown:${email}`);
    await this.redis.del(`otp:lockout:${email}`);

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    let isNewUser = false;
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          isVerified: true,
          tier: 'REGULAR',
          points: 0,
        },
      });
      isNewUser = true;
      this.logger.log(`Created new customer account: ${user.id} (${email})`);
    } else if (!user.isVerified) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }

    const payload: CustomerJwtPayload = {
      sub: user.id,
      email: user.email,
      role: 'CUSTOMER',
    };

    const accessToken = this.jwtService.sign(payload, {
      secret:
        process.env.JWT_CUSTOMER_SECRET ??
        'nida_store_customer_jwt_secret_key_2026_luxury_apparel',
      expiresIn: '7d',
    });

    const nameParts = [user.firstName, user.lastName].filter(
      (part): part is string => Boolean(part),
    );
    const fullName = nameParts.length > 0 ? nameParts.join(' ') : user.email;

    const apiUser: ApiUser = {
      id: user.id,
      email: user.email,
      phone: user.phone ?? undefined,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      fullName,
      tier: user.tier,
      points: user.points,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
    };

    return {
      success: true,
      accessToken,
      user: apiUser,
      isNewUser,
    };
  }

  async getProfile(userId: string): Promise<ApiUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Customer not found');
    }

    const fullName =
      [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

    return {
      id: user.id,
      email: user.email,
      phone: user.phone ?? undefined,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      fullName,
      tier: user.tier,
      points: user.points,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
