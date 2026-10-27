import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import {
  OrderLifecycleQueueName,
  ORDER_LIFECYCLE_JOB_RETENTION,
} from '@repo/types';
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
      {
        name: OrderLifecycleQueueName.ORDER_TIMEOUT,
        defaultJobOptions: ORDER_LIFECYCLE_JOB_RETENTION,
      },
      {
        name: OrderLifecycleQueueName.CANCELLATION_REVIEW,
        defaultJobOptions: ORDER_LIFECYCLE_JOB_RETENTION,
      },
      {
        name: OrderLifecycleQueueName.DELIVERY_COMPLETION,
        defaultJobOptions: ORDER_LIFECYCLE_JOB_RETENTION,
      },
      {
        name: OrderLifecycleQueueName.RETURN_DEADLINE,
        defaultJobOptions: ORDER_LIFECYCLE_JOB_RETENTION,
      },
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
