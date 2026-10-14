
import { Module } from '@nestjs/common';
import { CouponsModule } from '../coupons/coupons.module.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { CarrierMockService } from './carrier/index.js';

@Module({
  imports: [CouponsModule],
  controllers: [OrdersController],
  providers: [OrdersService, CarrierMockService],
  exports: [OrdersService, CarrierMockService],
})
export class OrdersModule {}

