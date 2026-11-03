import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { CustomersController } from './customers.controller.js';
import { PrismaModule } from '../../core/prisma/prisma.module.js';
import { RedisModule } from '../../core/redis/redis.module.js';
import { AuditLogModule } from '../audit-log/audit-log.module.js';

@Module({
  imports: [PrismaModule, RedisModule, AuditLogModule],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
