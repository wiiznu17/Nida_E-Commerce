import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { AdminRoleCode, type ApiAdminUser } from '@repo/types';

interface AuthenticatedRequest {
  user?: ApiAdminUser;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user || !user.role) {
      return false;
    }

    if (user.role.roleCode === AdminRoleCode.SUPER_ADMIN) {
      return true;
    }

    return requiredRoles.includes(user.role.roleCode);
  }
}
