import { Module } from '@nestjs/common';
import { CustomerCartController } from './cart.controller.js';
import { CustomerCartService } from './cart.service.js';
import { PrismaModule } from '../../core/prisma/prisma.module.js';
import { CustomerAuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, CustomerAuthModule],
  controllers: [CustomerCartController],
  providers: [CustomerCartService],
  exports: [CustomerCartService],
})
export class CartModule {}
