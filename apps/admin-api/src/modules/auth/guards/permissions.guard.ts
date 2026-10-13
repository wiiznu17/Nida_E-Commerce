import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import { AdminRoleCode, type ApiAdminUser } from '@repo/types';

interface AuthenticatedRequest {
  user?: ApiAdminUser;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user || !user.role) {
      return false;
    }

    if (user.role.roleCode === AdminRoleCode.SUPER_ADMIN) {
      return true;
    }

    const userPermissions = user.role.permissions ?? [];
    return requiredPermissions.every((perm) => userPermissions.includes(perm));
  }
}
