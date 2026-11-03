import { Global, Module } from '@nestjs/common';
import { AuditContextService } from './audit-context.service.js';

@Global()
@Module({
  providers: [AuditContextService],
  exports: [AuditContextService],
})
export class AuditContextModule {}
