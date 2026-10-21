import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
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
  CustomerRefreshResponse,
  CustomerSessionData,
  ApiUser,
  CustomerJwtPayload,
} from '@repo/types';
import type {
  RequestOtpInput,
  VerifyOtpInput,
  CustomerRefreshTokenInput,
  UpdateCustomerProfileInput,
  RequestEmailChangeInput,
  VerifyEmailChangeInput,
} from '@repo/validators';

export const JWT_ACCESS_EXPIRATION_SECONDS = 900; // 15 minutes
export const REFRESH_TOKEN_EXPIRATION_SECONDS = 604800; // 7 days

export interface ClientConnectionMeta {
  ip?: string;
  userAgent?: string;
}

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

    // Check account lockout
    const isLocked = await this.redis.get(`otp:lockout:${email}`);
    if (isLocked) {
      const remainingSeconds = await this.redis.ttl(`otp:lockout:${email}`);
      const mins = Math.max(1, Math.ceil(remainingSeconds / 60));
      throw new HttpException(
        `บัญชีนี้ถูกระงับการขอ OTP ชั่วคราวเนื่องจากกรอกรหัสผิดเกินจำนวนครั้ง กรุณารอ ${mins} นาที (Account temporarily locked. Please wait ${mins} minutes.)`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Cooldown verification
    const inCooldown = await this.redis.get(`otp:cooldown:${email}`);
    if (inCooldown) {
      const remainingCooldown = await this.redis.ttl(`otp:cooldown:${email}`);
      const waitSec = remainingCooldown > 0 ? remainingCooldown : 60;
      throw new HttpException(
        `กรุณารอ ${waitSec} วินาทีก่อนขอรหัส OTP ใหม่อีกครั้ง (Please wait ${waitSec}s before requesting a new OTP)`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Email rate limiting
    const rateLimit = await this.redis.checkRateLimit(`otp:${email}`, 3, 300);
    if (!rateLimit.allowed) {
      throw new HttpException(
        'ขอรหัส OTP ถี่เกินไป กรุณารอ 5 นาทีก่อนลองใหม่อีกครั้ง (Too many OTP requests. Please wait 5 minutes.)',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // IP rate limiting
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

  async verifyOtp(
    dto: VerifyOtpInput,
    meta: ClientConnectionMeta = {},
  ): Promise<VerifyOtpResponse> {
    const email = dto.email.trim().toLowerCase();
    const otpCode = dto.otpCode.trim();

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
      expiresIn: `${JWT_ACCESS_EXPIRATION_SECONDS}s`,
    });

    const refreshToken = crypto.randomUUID();
    const sessionData: CustomerSessionData = {
      sessionId: refreshToken,
      userId: user.id,
      email: user.email,
      device: this.parseDeviceName(meta.userAgent),
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
      createdAt: new Date().toISOString(),
      lastRotatedAt: new Date().toISOString(),
    };

    await this.redis.setCustomerSession(
      refreshToken,
      sessionData,
      REFRESH_TOKEN_EXPIRATION_SECONDS,
    );
    await this.redis.addCustomerSession(user.id, refreshToken);

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
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: JWT_ACCESS_EXPIRATION_SECONDS,
      user: apiUser,
      isNewUser,
    };
  }

  async refreshTokens(
    dto: CustomerRefreshTokenInput,
    meta: ClientConnectionMeta = {},
  ): Promise<CustomerRefreshResponse> {
    const session = await this.redis.getCustomerSession(dto.refreshToken);
    if (!session) {
      throw new UnauthorizedException(
        'เซสชันหมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่อีกครั้ง (Session expired or invalid)',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      await this.redis.deleteCustomerSession(dto.refreshToken);
      await this.redis.removeCustomerSession(session.userId, dto.refreshToken);
      throw new UnauthorizedException('Customer not found');
    }

    // Token rotation: revoke previous refresh token to prevent reuse attacks
    await this.redis.deleteCustomerSession(dto.refreshToken);
    await this.redis.removeCustomerSession(user.id, dto.refreshToken);

    const payload: CustomerJwtPayload = {
      sub: user.id,
      email: user.email,
      role: 'CUSTOMER',
    };

    const accessToken = this.jwtService.sign(payload, {
      secret:
        process.env.JWT_CUSTOMER_SECRET ??
        'nida_store_customer_jwt_secret_key_2026_luxury_apparel',
      expiresIn: `${JWT_ACCESS_EXPIRATION_SECONDS}s`,
    });

    const newRefreshToken = crypto.randomUUID();
    const updatedSession: CustomerSessionData = {
      ...session,
      sessionId: newRefreshToken,
      device: meta.userAgent
        ? this.parseDeviceName(meta.userAgent)
        : session.device,
      ipAddress: meta.ip ?? session.ipAddress,
      userAgent: meta.userAgent ?? session.userAgent,
      lastRotatedAt: new Date().toISOString(),
    };

    await this.redis.setCustomerSession(
      newRefreshToken,
      updatedSession,
      REFRESH_TOKEN_EXPIRATION_SECONDS,
    );
    await this.redis.addCustomerSession(user.id, newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      tokenType: 'Bearer',
      expiresIn: JWT_ACCESS_EXPIRATION_SECONDS,
    };
  }

  async logout(refreshToken?: string): Promise<{ success: boolean }> {
    if (refreshToken) {
      const session = await this.redis.getCustomerSession(refreshToken);
      if (session) {
        await this.redis.deleteCustomerSession(refreshToken);
        await this.redis.removeCustomerSession(session.userId, refreshToken);
      }
    }
    return { success: true };
  }

  async logoutAll(userId: string): Promise<{ success: boolean }> {
    await this.redis.revokeAllCustomerSessions(userId);
    return { success: true };
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

  async updateProfile(
    userId: string,
    dto: UpdateCustomerProfileInput,
  ): Promise<ApiUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Customer not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName:
          dto.firstName !== undefined ? dto.firstName.trim() : undefined,
        lastName: dto.lastName !== undefined ? dto.lastName.trim() : undefined,
        phone: dto.phone !== undefined ? dto.phone.trim() : undefined,
      },
    });

    const nameParts = [updatedUser.firstName, updatedUser.lastName].filter(
      (part): part is string => Boolean(part),
    );
    const fullName =
      nameParts.length > 0 ? nameParts.join(' ') : updatedUser.email;

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      phone: updatedUser.phone ?? undefined,
      firstName: updatedUser.firstName ?? undefined,
      lastName: updatedUser.lastName ?? undefined,
      fullName,
      tier: updatedUser.tier,
      points: updatedUser.points,
      isVerified: updatedUser.isVerified,
      createdAt: updatedUser.createdAt.toISOString(),
    };
  }

  async requestEmailChange(
    userId: string,
    dto: RequestEmailChangeInput,
  ): Promise<RequestOtpResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Customer not found');
    }

    const newEmail = dto.newEmail.trim().toLowerCase();
    if (newEmail === user.email.toLowerCase()) {
      throw new BadRequestException('อีเมลใหม่ต้องไม่ซ้ำกับอีเมลปัจจุบัน');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: newEmail },
    });
    if (existing) {
      throw new BadRequestException('อีเมลนี้ถูกใช้งานโดยบัญชีอื่นแล้ว');
    }

    const inCooldown = await this.redis.get(`otp:cooldown:${newEmail}`);
    if (inCooldown) {
      const remainingCooldown = await this.redis.ttl(
        `otp:cooldown:${newEmail}`,
      );
      const waitSec = remainingCooldown > 0 ? remainingCooldown : 60;
      throw new HttpException(
        `กรุณารอ ${waitSec} วินาทีก่อนขอรหัส OTP ใหม่อีกครั้ง`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const rateLimit = await this.redis.checkRateLimit(
      `otp:${newEmail}`,
      3,
      300,
    );
    if (!rateLimit.allowed) {
      throw new HttpException(
        'ขอรหัส OTP ถี่เกินไป กรุณารอ 5 นาทีก่อนลองใหม่อีกครั้ง',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.prisma.otpVerification.updateMany({
      where: { email: newEmail, isUsed: false },
      data: { isUsed: true },
    });

    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresInSeconds = 300;
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    await this.prisma.otpVerification.create({
      data: {
        email: newEmail,
        otpCode,
        expiresAt,
        isUsed: false,
        attemptsCount: 0,
      },
    });

    await this.redis.set(`otp:cooldown:${newEmail}`, '1', 60);
    await this.mailer.sendOtpEmail({ to: newEmail, otpCode });

    const isDev = process.env.NODE_ENV !== 'production';
    return {
      success: true,
      message: 'รหัส OTP สำหรับยืนยันอีเมลใหม่ถูกส่งเรียบร้อยแล้ว',
      expiresInSeconds,
      ...(isDev ? { devOtpCode: otpCode } : {}),
    };
  }

  async verifyEmailChange(
    userId: string,
    dto: VerifyEmailChangeInput,
    meta: ClientConnectionMeta = {},
  ): Promise<VerifyOtpResponse> {
    const newEmail = dto.newEmail.trim().toLowerCase();
    const otpCode = dto.otpCode.trim();

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Customer not found');
    }

    const otpRecord = await this.prisma.otpVerification.findFirst({
      where: {
        email: newEmail,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว');
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
      throw new BadRequestException('รหัส OTP ไม่ถูกต้อง');
    }

    await this.prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // Revoke all existing sessions across devices for safety
    await this.redis.revokeAllCustomerSessions(userId);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
    });

    const payload: CustomerJwtPayload = {
      sub: updatedUser.id,
      email: updatedUser.email,
      role: 'CUSTOMER',
    };

    const accessToken = this.jwtService.sign(payload, {
      secret:
        process.env.JWT_CUSTOMER_SECRET ??
        'nida_store_customer_jwt_secret_key_2026_luxury_apparel',
      expiresIn: `${JWT_ACCESS_EXPIRATION_SECONDS}s`,
    });

    const refreshToken = crypto.randomUUID();
    const sessionData: CustomerSessionData = {
      sessionId: refreshToken,
      userId: updatedUser.id,
      email: updatedUser.email,
      device: this.parseDeviceName(meta.userAgent),
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
      createdAt: new Date().toISOString(),
      lastRotatedAt: new Date().toISOString(),
    };

    await this.redis.setCustomerSession(
      refreshToken,
      sessionData,
      REFRESH_TOKEN_EXPIRATION_SECONDS,
    );
    await this.redis.addCustomerSession(updatedUser.id, refreshToken);

    const nameParts = [updatedUser.firstName, updatedUser.lastName].filter(
      (part): part is string => Boolean(part),
    );
    const fullName =
      nameParts.length > 0 ? nameParts.join(' ') : updatedUser.email;

    const apiUser: ApiUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      phone: updatedUser.phone ?? undefined,
      firstName: updatedUser.firstName ?? undefined,
      lastName: updatedUser.lastName ?? undefined,
      fullName,
      tier: updatedUser.tier,
      points: updatedUser.points,
      isVerified: updatedUser.isVerified,
      createdAt: updatedUser.createdAt.toISOString(),
    };

    return {
      success: true,
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: JWT_ACCESS_EXPIRATION_SECONDS,
      user: apiUser,
      isNewUser: false,
    };
  }

  private parseDeviceName(userAgent?: string): string {
    if (!userAgent) return 'Web Browser';
    if (/mobile/i.test(userAgent)) return 'Mobile Device';
    if (/iPad|tablet/i.test(userAgent)) return 'Tablet';
    if (/Macintosh|Mac OS|\bMac\b/i.test(userAgent)) return 'Mac';
    if (/Windows/i.test(userAgent)) return 'Windows PC';
    if (/Linux/i.test(userAgent)) return 'Linux';
    return 'Desktop Browser';
  }
}
