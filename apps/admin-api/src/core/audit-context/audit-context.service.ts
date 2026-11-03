import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface AuditRequestContext {
  ipAddress: string | null;
  userAgent: string | null;
  adminId?: string | null;
}

@Injectable()
export class AuditContextService {
  private readonly storage = new AsyncLocalStorage<AuditRequestContext>();

  run<T>(context: AuditRequestContext, fn: () => T): T {
    return this.storage.run(context, fn);
  }

  get(): AuditRequestContext | undefined {
    return this.storage.getStore();
  }
}
