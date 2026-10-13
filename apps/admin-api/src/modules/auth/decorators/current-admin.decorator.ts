import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { ApiAdminUser } from '@repo/types';

interface AuthenticatedRequest {
  user?: ApiAdminUser;
}

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ApiAdminUser | null => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user ?? null;
  },
);
