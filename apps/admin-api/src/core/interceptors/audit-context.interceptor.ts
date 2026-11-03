import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuditContextService } from '../audit-context/audit-context.service.js';
import type { Request } from 'express';

@Injectable()
export class AuditContextInterceptor implements NestInterceptor {
  constructor(private readonly auditContextService: AuditContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();

    const forwardedFor = request.headers['x-forwarded-for'];
    const ipAddress = (
      typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0].trim()
        : request.ip || request.socket.remoteAddress || null
    ) as string | null;

    const userAgent = (request.headers['user-agent'] as string) || null;
    const adminUser = (request as unknown as { user?: { id?: string } }).user;

    return new Observable((subscriber) => {
      this.auditContextService.run(
        {
          ipAddress,
          userAgent,
          adminId: adminUser?.id ?? null,
        },
        () => {
          next.handle().subscribe({
            next: (v) => subscriber.next(v),
            error: (e) => subscriber.error(e),
            complete: () => subscriber.complete(),
          });
        },
      );
    });
  }
}
