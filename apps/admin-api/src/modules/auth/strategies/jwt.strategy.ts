import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../core/prisma/prisma.service.js';
import type { AdminJwtPayload, ApiAdminUser } from '@repo/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_ACCESS_SECRET ??
        'nida_admin_access_jwt_secret_key_2026_luxury_apparel',
    });
  }

  async validate(payload: AdminJwtPayload): Promise<ApiAdminUser> {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const admin = await this.prisma.adminUser.findUnique({
      where: { id: payload.sub },
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
      throw new UnauthorizedException('Account not found or has been deactivated');
    }

    const permissions = admin.role.rolePermissions.map((rp) => rp.permission.permissionCode);

    return {
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
  }
}
