import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../core/prisma/prisma.service.js';
import { RedisService } from '../../core/redis/redis.service.js';
import { MailerService } from '../../core/mailer/mailer.service.js';
import { InviteAdminUserDto } from './dto/admin-user.dto.js';
import type { ApiAdminUser, ApiAdminRole, InviteAdminResponse } from '@repo/types';

const INVITE_TOKEN_EXPIRATION_SECONDS = 172800; // 48 hours

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly mailer: MailerService,
  ) {}

  async getAdminUsers(): Promise<ApiAdminUser[]> {
    const users = await this.prisma.adminUser.findMany({
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
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      fullName: u.fullName,
      department: u.department,
      role: {
        id: u.role.id,
        roleCode: u.role.roleCode,
        roleName: u.role.roleName,
        description: u.role.description,
        permissions: u.role.rolePermissions.map((rp) => rp.permission.permissionCode),
      },
      isActive: u.isActive,
      lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
      createdAt: u.createdAt.toISOString(),
    }));
  }

  async getRoles(): Promise<ApiAdminRole[]> {
    const roles = await this.prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { roleName: 'asc' },
    });

    return roles.map((r) => ({
      id: r.id,
      roleCode: r.roleCode,
      roleName: r.roleName,
      description: r.description,
      permissions: r.rolePermissions.map((rp) => rp.permission.permissionCode),
    }));
  }

  async inviteAdmin(dto: InviteAdminUserDto): Promise<InviteAdminResponse> {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      throw new ConflictException('อีเมลนี้มีอยู่ในระบบแล้ว');
    }

    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
    if (!role) {
      throw new NotFoundException('ไม่พบบทบาทที่เลือก');
    }

    const baseUsername = normalizedEmail.split('@')[0] ?? 'admin';
    let username = baseUsername;
    const usernameTaken = await this.prisma.adminUser.findUnique({
      where: { username },
    });
    if (usernameTaken) {
      username = `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`;
    }

    const newAdmin = await this.prisma.adminUser.create({
      data: {
        username,
        email: normalizedEmail,
        fullName: dto.fullName.trim(),
        department: dto.department?.trim() ?? null,
        roleId: role.id,
        isActive: false, // inactive until setup password completed
        passwordHash: 'INVITATION_PENDING',
      },
    });

    const inviteToken = randomUUID();
    await this.redis.setInviteToken(
      inviteToken,
      {
        adminId: newAdmin.id,
        email: newAdmin.email,
        fullName: newAdmin.fullName,
        roleId: role.id,
        department: newAdmin.department ?? undefined,
      },
      INVITE_TOKEN_EXPIRATION_SECONDS,
    );

    const portalUrl = process.env.ADMIN_PORTAL_URL ?? 'http://localhost:5173';
    const setupUrl = `${portalUrl}/admin/setup-password?token=${inviteToken}`;

    await this.mailer.sendAdminInvitation({
      to: newAdmin.email,
      fullName: newAdmin.fullName,
      setupUrl,
    });

    const permissions = role.rolePermissions.map((rp) => rp.permission.permissionCode);
    const apiAdmin: ApiAdminUser = {
      id: newAdmin.id,
      username: newAdmin.username,
      email: newAdmin.email,
      fullName: newAdmin.fullName,
      department: newAdmin.department,
      role: {
        id: role.id,
        roleCode: role.roleCode,
        roleName: role.roleName,
        description: role.description,
        permissions,
      },
      isActive: newAdmin.isActive,
      lastLoginAt: null,
      createdAt: newAdmin.createdAt.toISOString(),
    };

    return {
      adminUser: apiAdmin,
      inviteToken,
      inviteLink: setupUrl,
    };
  }

  async toggleActiveStatus(targetId: string, currentAdminId: string): Promise<ApiAdminUser> {
    if (targetId === currentAdminId) {
      throw new BadRequestException('ไม่สามารถปิดการใช้งานบัญชีของตนเองได้');
    }

    const target = await this.prisma.adminUser.findUnique({
      where: { id: targetId },
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

    if (!target) {
      throw new NotFoundException('ไม่พบข้อมูลแอดมิน');
    }

    const updated = await this.prisma.adminUser.update({
      where: { id: targetId },
      data: { isActive: !target.isActive },
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

    if (!updated.isActive) {
      await this.redis.revokeAllUserSessions(targetId);
    }

    return {
      id: updated.id,
      username: updated.username,
      email: updated.email,
      fullName: updated.fullName,
      department: updated.department,
      role: {
        id: updated.role.id,
        roleCode: updated.role.roleCode,
        roleName: updated.role.roleName,
        description: updated.role.description,
        permissions: updated.role.rolePermissions.map((rp) => rp.permission.permissionCode),
      },
      isActive: updated.isActive,
      lastLoginAt: updated.lastLoginAt?.toISOString() ?? null,
      createdAt: updated.createdAt.toISOString(),
    };
  }
}
