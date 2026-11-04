import { Module } from '@nestjs/common';
import { AdminReviewsService } from './reviews.service.js';
import { AdminReviewsController } from './reviews.controller.js';
import { PrismaModule } from '../../core/prisma/prisma.module.js';
import { AuditLogModule } from '../audit-log/audit-log.module.js';

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [AdminReviewsController],
  providers: [AdminReviewsService],
  exports: [AdminReviewsService],
})
export class AdminReviewsModule {}
