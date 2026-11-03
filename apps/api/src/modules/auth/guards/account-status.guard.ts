import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccountStatus, type ApiUser } from '@repo/types';
import { PrismaService } from '../../../core/prisma/prisma.service.js';
import {
  ALLOW_PENDING_VERIFICATION_KEY,
  REQUIRE_ACCOUNT_STATUS_KEY,
} from '../decorators/account-status.decorator.js';

@Injectable()
export class AccountStatusGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{ user?: ApiUser }>();
    const user = req.user;

    // If request has no authenticated user, let authentication guards (or public routes) handle it
    if (!user) {
      return true;
    }

    const allowPending = this.reflector.getAllAndOverride<boolean>(
      ALLOW_PENDING_VERIFICATION_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredStatuses = this.reflector.getAllAndOverride<AccountStatus[]>(
      REQUIRE_ACCOUNT_STATUS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredStatuses && requiredStatuses.length > 0) {
      if (requiredStatuses.includes(user.status)) {
        return true;
      }
    }

    if (user.status === AccountStatus.ACTIVE) {
      return true;
    }

    if (user.status === AccountStatus.SUSPENDED) {
      const now = new Date();
      const until = user.suspendedUntil ? new Date(user.suspendedUntil) : null;

      if (until && now < until) {
        const remainingSeconds = Math.max(
          1,
          Math.ceil((until.getTime() - now.getTime()) / 1000),
        );
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          errorCode: 'ACCOUNT_SUSPENDED',
          code: 'ACCOUNT_SUSPENDED',
          message:
            'บัญชีของคุณถูกระงับการใช้งานชั่วคราว (This account is temporarily suspended)',
          details: {
            reason: user.statusReason ?? undefined,
            suspendedUntil: user.suspendedUntil,
            retryAfterSeconds: remainingSeconds,
          },
        });
      }

      // Auto-Heal / Auto-Reactivate when suspension period has passed
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          status: AccountStatus.ACTIVE,
          statusReason: null,
          suspendedAt: null,
          suspendedUntil: null,
        },
      });

      user.status = AccountStatus.ACTIVE;
      user.statusReason = null;
      user.suspendedAt = null;
      user.suspendedUntil = null;
      return true;
    }

    if (user.status === AccountStatus.BANNED) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        errorCode: 'ACCOUNT_BANNED',
        code: 'ACCOUNT_BANNED',
        message:
          'บัญชีของคุณถูกระงับการให้บริการถาวร (This account has been permanently banned)',
        details: {
          reason: user.statusReason ?? undefined,
          supportEmail: 'support@nida-apparel.com',
        },
      });
    }

    if (user.status === AccountStatus.PENDING_VERIFICATION) {
      if (allowPending) {
        return true;
      }
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        errorCode: 'ACCOUNT_UNVERIFIED',
        code: 'ACCOUNT_UNVERIFIED',
        message:
          'กรุณายืนยันรหัส OTP เพื่อเปิดใช้งานบัญชีของคุณก่อนทำรายการ (Please verify your account OTP to proceed)',
        details: {
          verifyUrl: '/verify-otp',
        },
      });
    }

    if (user.status === AccountStatus.INACTIVE) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        errorCode: 'ACCOUNT_DEACTIVATED',
        code: 'ACCOUNT_DEACTIVATED',
        message:
          'บัญชีนี้ถูกปิดการใช้งาน กรุณาติดต่อฝ่ายบริการลูกค้า (This account has been deactivated)',
      });
    }

    return false;
  }
}
