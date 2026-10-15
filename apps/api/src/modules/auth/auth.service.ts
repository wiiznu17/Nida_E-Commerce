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

  async requestOtp(dto: RequestOtpInput): Promise<RequestOtpResponse> {
    const email = dto.email.trim().toLowerCase();

    const rateLimit = await this.redis.checkRateLimit(`otp:${email}`, 3, 300);
    if (!rateLimit.allowed) {
      throw new HttpException(
        'ขอรหัส OTP ถี่เกินไป กรุณารอ 5 นาทีก่อนลองใหม่อีกครั้ง (Too many OTP requests. Please wait 5 minutes.)',
        HttpStatus.TOO_MANY_REQUESTS,
      );
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
      throw new BadRequestException(
        'กรอกรหัสผิดเกินจำนวนครั้งที่กำหนด กรุณาขอรหัสใหม่ (Too many failed attempts)',
      );
    }

    if (otpRecord.otpCode !== otpCode) {
      await this.prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attemptsCount: { increment: 1 } },
      });
      throw new BadRequestException('รหัส OTP ไม่ถูกต้อง (Incorrect OTP code)');
    }

    await this.prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

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
