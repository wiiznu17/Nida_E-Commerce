import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Request } from 'express';
import {
  AdminRoleCode,
  AdminPermission,
  AuditActionType,
  type ApiAdminUser,
} from '@repo/types';
import { AuditLogService } from '../../modules/audit-log/audit-log.service.js';
import { maskEmail, maskPhone, maskAddressLine } from '../utils/sanitizer.js';

interface RequestWithAdmin extends Request {
  user?: ApiAdminUser;
}

@Injectable()
export class RoleBasedPiiInterceptor implements NestInterceptor {
  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithAdmin>();
    const revealPii = request.query?.revealPii === 'true';
    const user = request.user;

    const isSuperAdmin = user?.role?.roleCode === AdminRoleCode.SUPER_ADMIN;
    const hasPiiPermission = Boolean(
      user?.role?.permissions?.includes(AdminPermission.CUSTOMERS_PII_READ),
    );
    const isAuthorized = isSuperAdmin || hasPiiPermission;

    if (revealPii && !isAuthorized) {
      throw new ForbiddenException(
        'Insufficient permissions to reveal customer PII',
      );
    }

    return next.handle().pipe(
      map((data: unknown) => {
        if (!data || typeof data !== 'object') {
          return data;
        }

        if (revealPii && isAuthorized) {
          const targetId =
            (data as Record<string, unknown>)['orderNumber'] ??
            (data as Record<string, unknown>)['id'] ??
            request.params?.['orderNumber'] ??
            request.params?.['id'] ??
            'unknown';

          void this.auditLogService.recordLog({
            adminId: user?.id ?? null,
            actionType: AuditActionType.READ,
            targetTable: 'orders',
            targetId: String(targetId),
            permission: AdminPermission.CUSTOMERS_PII_READ,
            performedRole: user?.role?.roleCode ?? null,
            ipAddress: request.ip ?? null,
            userAgent: request.headers['user-agent'] ?? null,
            newValuesJson: {
              action: 'reveal_pii',
              fields: ['phone', 'email', 'addressLine1'],
            },
          });

          return data;
        }

        return this.maskPiiInPayload(data);
      }),
    );
  }

  private maskPiiInPayload(payload: unknown): unknown {
    if (!payload || typeof payload !== 'object') {
      return payload;
    }

    if (Array.isArray(payload)) {
      return payload.map((item) => this.maskPiiInPayload(item));
    }

    const obj = { ...(payload as Record<string, unknown>) };

    if (Array.isArray(obj['items'])) {
      obj['items'] = obj['items'].map((item) => this.maskPiiInPayload(item));
    }

    if (obj['shippingAddress'] && typeof obj['shippingAddress'] === 'object') {
      const addr = { ...(obj['shippingAddress'] as Record<string, unknown>) };
      if (typeof addr['phone'] === 'string') {
        addr['phone'] = maskPhone(addr['phone']);
      }
      if (typeof addr['addressLine1'] === 'string') {
        addr['addressLine1'] = maskAddressLine(addr['addressLine1']);
      }
      obj['shippingAddress'] = addr;
    }

    if (typeof obj['customerEmail'] === 'string') {
      obj['customerEmail'] = maskEmail(obj['customerEmail']);
    }

    if (obj['user'] && typeof obj['user'] === 'object') {
      const u = { ...(obj['user'] as Record<string, unknown>) };
      if (typeof u['email'] === 'string') {
        u['email'] = maskEmail(u['email']);
      }
      if (typeof u['phone'] === 'string') {
        u['phone'] = maskPhone(u['phone']);
      }
      obj['user'] = u;
    }

    return obj;
  }
}
