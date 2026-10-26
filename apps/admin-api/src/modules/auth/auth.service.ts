import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { RedisService } from '../../core/redis/redis.service.js';
import { MailerService } from '../../core/mailer/mailer.service.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';
import { AuditActionType, AdminPermission } from '@repo/types';
import {
  AdminLoginDto,
  RefreshTokenDto,
  SetupPasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto.js';
import type {
  AdminLoginResponse,
  AdminRefreshResponse,
  AdminJwtPayload,
  ApiAdminUser,
  RedisSessionData,
  VerifyTokenResponse,
} from '@repo/types';

export interface ClientConnectionMeta {
  ip?: string;
  userAgent?: string;
}

const JWT_ACCESS_EXPIRATION_SECONDS = 900; // 15 minutes
const REFRESH_TOKEN_EXPIRATION_SECONDS = 604800; // 7 days
const INVITE_TOKEN_EXPIRATION_SECONDS = 172800; // 48 hours
const RESET_TOKEN_EXPIRATION_SECONDS = 900; // 15 minutes
const MAX_LOGIN_ATTEMPTS_PER_WINDOW = 5;
const LOGIN_RATE_LIMIT_WINDOW_SECONDS = 60;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwt: JwtService,
    private readonly mailer: MailerService,
    private readonly auditLog?: AuditLogService,
  ) {}

  async login(
    dto: AdminLoginDto,
    meta: ClientConnectionMeta = {},
  ): Promise<AdminLoginResponse> {
    const rateLimitIdentifier = `${meta.ip ?? 'local'}:${dto.identifier.trim().toLowerCase()}`;
    const rateCheck = await this.redis.checkRateLimit(
      rateLimitIdentifier,
      MAX_LOGIN_ATTEMPTS_PER_WINDOW,
      LOGIN_RATE_LIMIT_WINDOW_SECONDS,
    );

    if (!rateCheck.allowed) {
      throw new HttpException(
        `พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอ ${rateCheck.retryAfter} วินาทีก่อนลองใหม่อีกครั้ง`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const admin = await this.prisma.adminUser.findFirst({
      where: {
        OR: [
          { username: dto.identifier.trim() },
          { email: dto.identifier.trim().toLowerCase() },
        ],
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      admin.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }

    await this.redis.clearRateLimit(rateLimitIdentifier);

    const permissions = admin.role.rolePermissions.map(
      (rp) => rp.permission.permissionCode,
    );

    const jwtPayload: AdminJwtPayload = {
      sub: admin.id,
      username: admin.username,
      email: admin.email,
      roleCode: admin.role.roleCode,
      permissions,
    };

    const accessToken = await this.jwt.signAsync(jwtPayload, {
      expiresIn: `${JWT_ACCESS_EXPIRATION_SECONDS}s`,
    });

    const refreshToken = randomUUID();
    const sessionData: RedisSessionData = {
      sessionId: refreshToken,
      adminId: admin.id,
      username: admin.username,
      fullName: admin.fullName,
      roleCode: admin.role.roleCode,
      permissions,
      device: this.parseDeviceName(meta.userAgent),
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
      createdAt: new Date().toISOString(),
      lastRotatedAt: new Date().toISOString(),
    };

    await this.redis.setSession(
      refreshToken,
      sessionData,
      REFRESH_TOKEN_EXPIRATION_SECONDS,
    );
    await this.redis.addSessionToUser(admin.id, refreshToken);

    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const apiAdmin: ApiAdminUser = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      fullName: admin.fullName,
      department: admin.department,
      role: {
        id: admin.role.id,
        roleCode: admin.role.roleCode,
        roleName: admin.role.roleName,
        description: admin.role.description,
        permissions,
      },
      isActive: admin.isActive,
      lastLoginAt: admin.lastLoginAt?.toISOString() ?? null,
      createdAt: admin.createdAt.toISOString(),
    };

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: JWT_ACCESS_EXPIRATION_SECONDS,
      admin: apiAdmin,
    };
  }

  async refresh(
    dto: RefreshTokenDto,
    meta: ClientConnectionMeta = {},
  ): Promise<AdminRefreshResponse> {
    const session = await this.redis.getSession(dto.refreshToken);

    if (!session) {
      throw new UnauthorizedException(
        'Session has expired or token is invalid',
      );
    }

    await this.redis.deleteSession(dto.refreshToken);
    await this.redis.removeSessionFromUser(session.adminId, dto.refreshToken);

    const admin = await this.prisma.adminUser.findUnique({
      where: { id: session.adminId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Admin account deactivated or removed');
    }

    const permissions = admin.role.rolePermissions.map(
      (rp) => rp.permission.permissionCode,
    );

    const jwtPayload: AdminJwtPayload = {
      sub: admin.id,
      username: admin.username,
      email: admin.email,
      roleCode: admin.role.roleCode,
      permissions,
    };

    const newAccessToken = await this.jwt.signAsync(jwtPayload, {
      expiresIn: `${JWT_ACCESS_EXPIRATION_SECONDS}s`,
    });

    const newRefreshToken = randomUUID();
    const updatedSession: RedisSessionData = {
      ...session,
      sessionId: newRefreshToken,
      device: this.parseDeviceName(meta.userAgent) ?? session.device,
      ipAddress: meta.ip ?? session.ipAddress,
      userAgent: meta.userAgent ?? session.userAgent,
      lastRotatedAt: new Date().toISOString(),
    };

    await this.redis.setSession(
      newRefreshToken,
      updatedSession,
      REFRESH_TOKEN_EXPIRATION_SECONDS,
    );
    await this.redis.addSessionToUser(admin.id, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      tokenType: 'Bearer',
      expiresIn: JWT_ACCESS_EXPIRATION_SECONDS,
    };
  }

  async logout(refreshToken?: string, adminId?: string): Promise<void> {
    if (refreshToken) {
      await this.redis.deleteSession(refreshToken);
      if (adminId) {
        await this.redis.removeSessionFromUser(adminId, refreshToken);
      }
    }
  }

  async logoutAll(adminId: string): Promise<void> {
    await this.redis.revokeAllUserSessions(adminId);
  }

  async verifyToken(
    token: string,
    type: 'invite' | 'reset',
  ): Promise<VerifyTokenResponse> {
    if (type === 'invite') {
      const invite = await this.redis.getInviteToken(token);
      if (!invite) return { valid: false };
      return {
        valid: true,
        email: invite.email,
        fullName: invite.fullName,
      };
    }

    const reset = await this.redis.getResetToken(token);
    if (!reset) return { valid: false };
    return {
      valid: true,
      email: reset.email,
    };
  }

  async setupPassword(
    dto: SetupPasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    const invite = await this.redis.getInviteToken(dto.token);
    if (!invite) {
      throw new BadRequestException('ลิงก์คำเชิญนี้ไม่ถูกต้องหรือหมดอายุแล้ว');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    await this.prisma.adminUser.update({
      where: { id: invite.adminId },
      data: {
        passwordHash,
        isActive: true,
      },
    });

    await this.redis.deleteInviteToken(dto.token);

    void this.auditLog?.recordLog({
      adminId: invite.adminId,
      actionType: AuditActionType.STATUS_CHANGE,
      targetTable: 'admin_users',
      targetId: invite.adminId,
      permission: AdminPermission.ADMIN_USERS_MANAGE,
      newValuesJson: {
        email: invite.email,
        fullName: invite.fullName,
        isActive: true,
        action: 'INVITATION_ACTIVATED',
      },
    });

    return {
      success: true,
      message: 'ตั้งรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่',
    };
  }

  async forgotPassword(
    dto: ForgotPasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
    });

    if (admin && admin.isActive) {
      const resetToken = randomUUID();
      await this.redis.setResetToken(
        resetToken,
        {
          adminId: admin.id,
          email: admin.email,
        },
        RESET_TOKEN_EXPIRATION_SECONDS,
      );

      const portalUrl = process.env.ADMIN_PORTAL_URL ?? 'http://localhost:5173';
      const resetUrl = `${portalUrl}/admin/reset-password?token=${resetToken}`;

      await this.mailer.sendPasswordReset({
        to: admin.email,
        resetUrl,
      });
    }

    return {
      success: true,
      message:
        'หากอีเมลนี้มีอยู่ในระบบ ลิงก์สำหรับรีเซ็ตรหัสผ่านจะถูกส่งไปยังกล่องข้อความของคุณ',
    };
  }

  async resetPassword(
    dto: ResetPasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    const reset = await this.redis.getResetToken(dto.token);
    if (!reset) {
      throw new BadRequestException(
        'ลิงก์รีเซ็ตรหัสผ่านนี้ไม่ถูกต้องหรือหมดอายุแล้ว',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    await this.prisma.adminUser.update({
      where: { id: reset.adminId },
      data: { passwordHash },
    });

    await this.redis.revokeAllUserSessions(reset.adminId);
    await this.redis.deleteResetToken(dto.token);

    void this.auditLog?.recordLog({
      adminId: reset.adminId,
      actionType: AuditActionType.UPDATE,
      targetTable: 'admin_users',
      targetId: reset.adminId,
      permission: AdminPermission.ADMIN_USERS_MANAGE,
      newValuesJson: {
        email: reset.email,
        action: 'PASSWORD_RESET',
      },
    });

    return {
      success: true,
      message: 'รีเซ็ตรหัสผ่านเรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่',
    };
  }

  private parseDeviceName(userAgent?: string): string {
    if (!userAgent) return 'Web Browser';

    if (userAgent.includes('Edg/')) return 'Edge Browser';
    if (userAgent.includes('Chrome/')) {
      if (userAgent.includes('Macintosh')) return 'Chrome on macOS';
      if (userAgent.includes('Windows')) return 'Chrome on Windows';
      if (userAgent.includes('Linux')) return 'Chrome on Linux';
      return 'Chrome Browser';
    }
    if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
      if (userAgent.includes('iPhone')) return 'Safari on iPhone';
      if (userAgent.includes('iPad')) return 'Safari on iPad';
      if (userAgent.includes('Macintosh')) return 'Safari on macOS';
      return 'Safari Browser';
    }
    if (userAgent.includes('Firefox/')) return 'Firefox Browser';

    return 'Desktop/Mobile Browser';
  }
}
