import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import { ReviewsController } from './reviews.controller.js';
import { PrismaModule } from '../../core/prisma/prisma.module.js';
import { RedisModule } from '../../core/redis/redis.module.js';
import { CustomerAuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, RedisModule, CustomerAuthModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
