import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/prisma/prisma.module.js';
import { CustomerAuthModule } from '../auth/auth.module.js';
import { WishlistController } from './wishlist.controller.js';
import { WishlistService } from './wishlist.service.js';

@Module({
  imports: [PrismaModule, CustomerAuthModule],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService],
})
export class WishlistModule {}
