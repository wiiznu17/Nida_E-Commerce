import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OrderLifecycleQueueName } from '@repo/types';
import { OrderLifecycleProducerService } from './order-lifecycle-producer.service.js';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: OrderLifecycleQueueName.ORDER_TIMEOUT },
      { name: OrderLifecycleQueueName.CANCELLATION_REVIEW },
      { name: OrderLifecycleQueueName.DELIVERY_COMPLETION },
      { name: OrderLifecycleQueueName.RETURN_DEADLINE },
    ),
  ],
  providers: [OrderLifecycleProducerService],
  exports: [BullModule, OrderLifecycleProducerService],
})
export class OrderLifecycleModule {}
