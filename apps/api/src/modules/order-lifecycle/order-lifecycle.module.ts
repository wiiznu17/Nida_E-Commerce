import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OrderLifecycleQueueName } from '@repo/types';
import { PrismaModule } from '../../core/prisma/prisma.module.js';
import { OrderLifecycleProducerService } from './order-lifecycle-producer.service.js';
import {
  OrderTimeoutWorker,
  CancellationReviewWorker,
  DeliveryCompleteWorker,
  ReturnShipmentWorker,
} from './workers/index.js';
import { OmiseService } from '../orders/omise.service.js';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue(
      { name: OrderLifecycleQueueName.ORDER_TIMEOUT },
      { name: OrderLifecycleQueueName.CANCELLATION_REVIEW },
      { name: OrderLifecycleQueueName.DELIVERY_COMPLETION },
      { name: OrderLifecycleQueueName.RETURN_DEADLINE },
    ),
  ],
  providers: [
    OrderLifecycleProducerService,
    OrderTimeoutWorker,
    CancellationReviewWorker,
    DeliveryCompleteWorker,
    ReturnShipmentWorker,
    OmiseService,
  ],
  exports: [BullModule, OrderLifecycleProducerService],
})
export class OrderLifecycleModule {}
