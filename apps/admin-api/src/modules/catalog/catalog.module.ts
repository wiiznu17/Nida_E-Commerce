import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller.js';
import { CatalogService } from './catalog.service.js';
import { UploadModule } from '../upload/upload.module.js';
import { AuditLogModule } from '../audit-log/audit-log.module.js';

@Module({
  imports: [UploadModule, AuditLogModule],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
