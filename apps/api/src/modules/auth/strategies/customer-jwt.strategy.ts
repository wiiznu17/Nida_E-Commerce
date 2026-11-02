import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { PrismaService } from '../../../core/prisma/prisma.service.js';
import { RedisService } from '../../../core/redis/redis.service.js';
import type { CustomerJwtPayload, ApiUser } from '@repo/types';

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(
  Strategy,
  'customer-jwt',
) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey:
        process.env.JWT_CUSTOMER_SECRET ??
        'nida_store_customer_jwt_secret_key_2026_luxury_apparel',
    });
  }

  async validate(
    req: Request,
    payload: CustomerJwtPayload,
  ): Promise<ApiUser> {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token) {
      const isBlacklisted = await this.redis.isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }
    }

    const revokedBefore = await this.redis.getUserRevocationTimestamp(payload.sub);
    if (revokedBefore && payload.iat && payload.iat < revokedBefore) {
      throw new UnauthorizedException(
        'Session has been revoked on all devices. Please login again.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Customer account not found');
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
