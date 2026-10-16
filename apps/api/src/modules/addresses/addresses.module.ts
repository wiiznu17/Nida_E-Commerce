import { Module } from '@nestjs/common';
import { CustomerAddressesController } from './addresses.controller.js';
import { CustomerAddressesService } from './addresses.service.js';
import { PrismaModule } from '../../core/prisma/prisma.module.js';
import { CustomerAuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, CustomerAuthModule],
  controllers: [CustomerAddressesController],
  providers: [CustomerAddressesService],
  exports: [CustomerAddressesService],
})
export class AddressesModule {}
