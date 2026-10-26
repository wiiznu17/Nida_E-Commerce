import { Module } from '@nestjs/common';
import { CustomerCartController } from './cart.controller.js';
import { CustomerCartService } from './cart.service.js';
import { PrismaModule } from '../../core/prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [CustomerCartController],
  providers: [CustomerCartService],
  exports: [CustomerCartService],
})
export class CartModule {}
