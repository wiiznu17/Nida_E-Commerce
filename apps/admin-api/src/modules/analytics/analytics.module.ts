import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/prisma/prisma.module.js';
import { RedisModule } from '../../core/redis/redis.module.js';
import { AnalyticsController } from './analytics.controller.js';
import { AnalyticsService } from './analytics.service.js';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
