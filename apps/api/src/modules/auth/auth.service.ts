import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { RedisService } from '../../core/redis/redis.service.js';
import { MailerService } from '../../core/mailer/mailer.service.js';
import type {
  RequestOtpResponse,
  CustomerOtpChallengeResponse,
  VerifyOtpResponse,
  CustomerRefreshResponse,
  CustomerSessionData,
  ApiUser,
  CustomerJwtPayload,
  MembershipTier,
} from '@repo/types';
import type {
  RequestOtpInput,
  VerifyOtpInput,
  CustomerLoginInput,
  CustomerRegisterInput,
  CustomerVerifyOtpInput,
  CustomerResendOtpInput,
  CustomerForgotPasswordInput,
  CustomerResetPasswordInput,
  CustomerRefreshTokenInput,
  UpdateCustomerProfileInput,
  CustomerChangePasswordInput,
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

  async checkEmail(email: string): Promise<{ exists: boolean }> {
    if (!email || typeof email !== 'string') {
      return { exists: false };
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@')) {
      return { exists: false };
    }
    const user = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    });
    return { exists: Boolean(user) };
  }

  /**
   * Helper: Dispatches a 6-digit OTP to customer email with rate-limiting and cooldown.
   */
  private async dispatchOtp(
    email: string,
    clientIp?: string,
    successMessage = 'รหัส OTP ถูกส่งไปยังอีเมลเรียบร้อยแล้ว (OTP sent successfully)',
  ): Promise<CustomerOtpChallengeResponse> {
    const isLocked = await this.redis.get(`otp:lockout:${email}`);
    if (isLocked) {
      const remainingSeconds = await this.redis.ttl(`otp:lockout:${email}`);
      const mins = Math.max(1, Math.ceil(remainingSeconds / 60));
      throw new HttpException(
        `บัญชีนี้ถูกระงับการขอ OTP ชั่วคราวเนื่องจากกรอกรหัสผิดเกินจำนวนครั้ง กรุณารอ ${mins} นาที (Account temporarily locked. Please wait ${mins} minutes.)`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const inCooldown = await this.redis.get(`otp:cooldown:${email}`);
    if (inCooldown) {
      const remainingCooldown = await this.redis.ttl(`otp:cooldown:${email}`);
      const waitSec = remainingCooldown > 0 ? remainingCooldown : 60;
      throw new HttpException(
        `กรุณารอ ${waitSec} วินาทีก่อนขอรหัส OTP ใหม่อีกครั้ง (Please wait ${waitSec}s before requesting a new OTP)`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const rateLimit = await this.redis.checkRateLimit(`otp:${email}`, 3, 300);
    if (!rateLimit.allowed) {
      throw new HttpException(
        'ขอรหัส OTP ถี่เกินไป กรุณารอ 5 นาทีก่อนลองใหม่อีกครั้ง (Too many OTP requests. Please wait 5 minutes.)',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

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

    this.logger.log(`OTP generated and sent to: ${email}`);

    const isDev = process.env.NODE_ENV !== 'production';
    return {
      success: true,
      requireOtp: true,
      message: successMessage,
      email,
      expiresInSeconds,
      ...(isDev ? { devOtpCode: otpCode } : {}),
    };
  }

  /**
   * Helper: Validates 6-digit OTP record, handles lockout and attempt tracking.
   */
  private async validateOtpRecord(
    email: string,
    otpCode: string,
  ): Promise<void> {
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
  }

  /**
   * Helper: Issues JWT token pair and persists customer session to Redis.
   */
  private async issueTokensAndSession(
    user: {
      id: string;
      email: string;
      phone?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      tier: MembershipTier;
      points: number;
      isVerified: boolean;
      createdAt: Date;
    },
    meta: ClientConnectionMeta = {},
    isNewUser = false,
  ): Promise<VerifyOtpResponse> {
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

  /**
   * STEP 1 SIGN UP: Register new customer with password and send OTP challenge.
   */
  async register(
    dto: CustomerRegisterInput,
    clientIp?: string,
  ): Promise<CustomerOtpChallengeResponse> {
    const cleanEmail = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser && existingUser.isVerified) {
      throw new ConflictException(
        'อีเมลนี้มีบัญชีผู้ใช้อยู่แล้ว กรุณาเข้าสู่ระบบ (This email is already registered. Please sign in.)',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    if (existingUser) {
      await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          phone: dto.phone?.trim() ?? null,
          passwordHash,
        },
      });
    } else {
      await this.prisma.user.create({
        data: {
          email: cleanEmail,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          phone: dto.phone?.trim() ?? null,
          passwordHash,
          isVerified: false,
          tier: 'REGULAR',
          points: 0,
        },
      });
    }

    return this.dispatchOtp(
      cleanEmail,
      clientIp,
      'รหัส OTP สำหรับยืนยันการสมัครสมาชิกถูกส่งไปยังอีเมลแล้ว (Verification OTP sent)',
    );
  }

  /**
   * STEP 2 SIGN UP: Verify OTP code and complete customer registration.
   */
  async verifyRegisterOtp(
    dto: CustomerVerifyOtpInput,
    meta: ClientConnectionMeta = {},
  ): Promise<VerifyOtpResponse> {
    const cleanEmail = dto.email.trim().toLowerCase();
    await this.validateOtpRecord(cleanEmail, dto.otpCode.trim());

    const user = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      throw new NotFoundException('Customer record not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    this.logger.log(`Customer registration completed: ${updatedUser.id} (${cleanEmail})`);
    return this.issueTokensAndSession(updatedUser, meta, true);
  }

  /**
   * STEP 1 SIGN IN: Verify email and password, then send OTP challenge.
   */
  async login(
    dto: CustomerLoginInput,
    clientIp?: string,
  ): Promise<CustomerOtpChallengeResponse> {
    const cleanEmail = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      throw new NotFoundException(
        'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาสมัครสมาชิกก่อนเข้าสู่ระบบ (Account not found. Please sign up.)',
      );
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'บัญชีนี้ยังไม่ได้ตั้งรหัสผ่าน กรุณากดลืมรหัสผ่านเพื่อตั้งรหัสผ่านใหม่ (Password not set. Please reset your password.)',
      );
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException(
        'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง (Invalid password. Please try again.)',
      );
    }

    return this.dispatchOtp(
      cleanEmail,
      clientIp,
      'รหัส OTP สำหรับยืนยันเข้าสู่ระบบถูกส่งไปยังอีเมลแล้ว (Login OTP sent)',
    );
  }

  /**
   * STEP 2 SIGN IN: Verify OTP code and issue authenticated session.
   */
  async verifyLoginOtp(
    dto: CustomerVerifyOtpInput,
    meta: ClientConnectionMeta = {},
  ): Promise<VerifyOtpResponse> {
    const cleanEmail = dto.email.trim().toLowerCase();
    await this.validateOtpRecord(cleanEmail, dto.otpCode.trim());

    const user = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      throw new NotFoundException(
        'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาสมัครสมาชิกก่อนเข้าสู่ระบบ (Account not found. Please sign up.)',
      );
    }

    let activeUser = user;
    if (!user.isVerified) {
      activeUser = await this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }

    return this.issueTokensAndSession(activeUser, meta, false);
  }

  /**
   * Resend OTP for either login or register flow.
   */
  async resendOtp(
    dto: CustomerResendOtpInput,
    clientIp?: string,
  ): Promise<CustomerOtpChallengeResponse> {
    const cleanEmail = dto.email.trim().toLowerCase();
    return this.dispatchOtp(cleanEmail, clientIp);
  }

  /**
   * Request password reset OTP.
   */
  async forgotPassword(
    dto: CustomerForgotPasswordInput,
    clientIp?: string,
  ): Promise<CustomerOtpChallengeResponse> {
    const cleanEmail = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(
        'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบอีเมลอีกครั้ง (Account not found.)',
      );
    }

    return this.dispatchOtp(
      cleanEmail,
      clientIp,
      'รหัส OTP สำหรับรีเซ็ตรหัสผ่านถูกส่งไปยังอีเมลแล้ว',
    );
  }

  /**
   * Reset password with OTP verification.
   */
  async resetPassword(
    dto: CustomerResetPasswordInput,
  ): Promise<{ success: boolean; message: string }> {
    const cleanEmail = dto.email.trim().toLowerCase();
    await this.validateOtpRecord(cleanEmail, dto.otpCode.trim());

    const user = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      throw new NotFoundException('Customer account not found');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        isVerified: true,
      },
    });

    // Revoke all existing sessions across devices for safety
    await this.redis.revokeAllCustomerSessions(user.id);

    return {
      success: true,
      message: 'ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่',
    };
  }

  /**
   * Change password for authenticated customer.
   */
  async changePassword(
    userId: string,
    dto: CustomerChangePasswordInput,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Customer account not found');
    }

    if (!user.passwordHash) {
      throw new BadRequestException(
        'บัญชีนี้ยังไม่ได้ตั้งรหัสผ่าน กรุณาใช้ระบบลืมรหัสผ่านเพื่อตั้งรหัสผ่านใหม่ (Password not set on this account. Please use forgot password.)',
      );
    }

    const isMatch = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isMatch) {
      throw new BadRequestException(
        'รหัสผ่านปัจจุบันไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง (Current password is incorrect.)',
      );
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
      },
    });

    return {
      success: true,
      message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว (Password changed successfully)',
    };
  }

  async requestOtp(
    dto: RequestOtpInput,
    clientIp?: string,
  ): Promise<RequestOtpResponse> {
    const email = dto.email.trim().toLowerCase();

    // Verify account existence based on authentication intent
    if (dto.intent === 'signin') {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (!existingUser) {
        throw new NotFoundException(
          'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาสมัครสมาชิกก่อนเข้าสู่ระบบ (Account not found. Please sign up.)',
        );
      }
    } else if (dto.intent === 'signup') {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (existingUser) {
        throw new ConflictException(
          'อีเมลนี้มีบัญชีผู้ใช้อยู่แล้ว กรุณาเข้าสู่ระบบ (This email is already registered. Please sign in.)',
        );
      }
    }

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
    if (dto.intent === 'signin') {
      if (!user) {
        throw new NotFoundException(
          'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาสมัครสมาชิกก่อนเข้าสู่ระบบ (Account not found. Please sign up.)',
        );
      }
    } else if (dto.intent === 'signup') {
      if (user) {
        throw new BadRequestException(
          'อีเมลนี้มีบัญชีผู้ใช้อยู่แล้ว กรุณาเข้าสู่ระบบ (This email is already registered. Please sign in.)',
        );
      }
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
    } else {
      // Fallback for legacy calls without explicit intent
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
      }
    }

    if (user && user.isVerified === false) {
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
      if (updatedUser) {
        user = updatedUser;
      }
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
