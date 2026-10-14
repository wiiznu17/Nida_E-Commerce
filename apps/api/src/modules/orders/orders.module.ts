import { Module } from '@nestjs/common';
import { CustomerOrdersController } from './orders.controller.js';
import { CustomerOrdersService } from './orders.service.js';
import { PrismaModule } from '../../core/prisma/prisma.module.js';
import { MailerModule } from '../../core/mailer/mailer.module.js';

@Module({
  imports: [PrismaModule, MailerModule],
  controllers: [CustomerOrdersController],
  providers: [CustomerOrdersService],
  exports: [CustomerOrdersService],
})
export class OrdersModule {}
