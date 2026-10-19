import { Module } from '@nestjs/common';
import { CustomerOrdersController } from './orders.controller.js';
import { CustomerOrdersService } from './orders.service.js';
import { OmiseService } from './omise.service.js';
import { PrismaModule } from '../../core/prisma/prisma.module.js';
import { MailerModule } from '../../core/mailer/mailer.module.js';
import { CustomerAuthModule } from '../auth/auth.module.js';

import { OrderLifecycleModule } from '../order-lifecycle/index.js';

@Module({
  imports: [PrismaModule, MailerModule, CustomerAuthModule, OrderLifecycleModule],
  controllers: [CustomerOrdersController],
  providers: [CustomerOrdersService, OmiseService],
  exports: [CustomerOrdersService, OmiseService],
})
export class OrdersModule {}
