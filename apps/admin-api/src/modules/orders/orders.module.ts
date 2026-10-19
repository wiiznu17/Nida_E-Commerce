import { Module } from '@nestjs/common';
import { CouponsModule } from '../coupons/coupons.module.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { CarrierMockService } from './carrier/index.js';
import {
  LogisticsService,
  InternalLogisticsProvider,
  ShippopLogisticsProvider,
} from './logistics/index.js';
import {
  PaymentGatewayService,
  MockPaymentGatewayProvider,
  OmisePaymentGatewayProvider,
} from './payment-gateway/index.js';

import { OrderLifecycleModule } from '../order-lifecycle/index.js';

@Module({
  imports: [CouponsModule, OrderLifecycleModule],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    CarrierMockService,
    LogisticsService,
    InternalLogisticsProvider,
    ShippopLogisticsProvider,
    PaymentGatewayService,
    MockPaymentGatewayProvider,
    OmisePaymentGatewayProvider,
  ],
  exports: [
    OrdersService,
    CarrierMockService,
    LogisticsService,
    PaymentGatewayService,
  ],
})
export class OrdersModule {}

