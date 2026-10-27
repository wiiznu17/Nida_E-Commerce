import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  OrderLifecycleQueueName,
  OrderLifecycleJobName,
  ORDER_TIMEOUT_MS,
  ORDER_LIFECYCLE_JOB_RETENTION,
  type AutoCancelOrderJobData,
  type AutoApproveCancellationJobData,
  type AutoCompleteDeliveryJobData,
  type VoidExpiredReturnJobData,
} from '@repo/types';

@Injectable()
export class OrderLifecycleProducerService {
  private readonly logger = new Logger(OrderLifecycleProducerService.name);

  constructor(
    @InjectQueue(OrderLifecycleQueueName.ORDER_TIMEOUT)
    private readonly orderTimeoutQueue: Queue<AutoCancelOrderJobData>,

    @InjectQueue(OrderLifecycleQueueName.CANCELLATION_REVIEW)
    private readonly cancellationReviewQueue: Queue<AutoApproveCancellationJobData>,

    @InjectQueue(OrderLifecycleQueueName.DELIVERY_COMPLETION)
    private readonly deliveryCompletionQueue: Queue<AutoCompleteDeliveryJobData>,

    @InjectQueue(OrderLifecycleQueueName.RETURN_DEADLINE)
    private readonly returnDeadlineQueue: Queue<VoidExpiredReturnJobData>,
  ) {}

  async scheduleOrderTimeout(
    orderId: string,
    orderNumber: string,
    delayMs: number = ORDER_TIMEOUT_MS.PROMPTPAY,
  ): Promise<string> {
    const jobId = `order-timeout-${orderId}`;
    try {
      const job = await this.orderTimeoutQueue.add(
        OrderLifecycleJobName.AUTO_CANCEL_ORDER,
        { orderId, orderNumber },
        {
          jobId,
          delay: delayMs,
          ...ORDER_LIFECYCLE_JOB_RETENTION,
        },
      );
      this.logger.log(
        `Scheduled unpaid order timeout for Order #${orderNumber} (${orderId}) in ${delayMs / 1000}s [Job: ${job.id}]`,
      );
      return job.id ?? jobId;
    } catch (err: unknown) {
      this.logger.error(
        `Failed to schedule order timeout for Order #${orderNumber}: ${err instanceof Error ? err.message : String(err)}`,
      );
      return jobId;
    }
  }

  async cancelOrderTimeout(orderId: string): Promise<boolean> {
    const jobId = `order-timeout-${orderId}`;
    try {
      const job = await this.orderTimeoutQueue.getJob(jobId);
      if (job) {
        await job.remove();
        this.logger.log(
          `Removed unpaid order timeout job [${jobId}] for Order ${orderId}`,
        );
        return true;
      }
      return false;
    } catch (err: unknown) {
      this.logger.warn(
        `Failed to remove order timeout job [${jobId}]: ${err instanceof Error ? err.message : String(err)}`,
      );
      return false;
    }
  }

  async scheduleCancellationReviewTimeout(
    orderId: string,
    requestId: string,
    orderNumber: string,
    delayMs: number = ORDER_TIMEOUT_MS.CANCELLATION_REVIEW,
  ): Promise<string> {
    const jobId = `cancel-review-${requestId}`;
    try {
      const job = await this.cancellationReviewQueue.add(
        OrderLifecycleJobName.AUTO_APPROVE_CANCELLATION,
        { orderId, requestId, orderNumber },
        {
          jobId,
          delay: delayMs,
          ...ORDER_LIFECYCLE_JOB_RETENTION,
        },
      );
      this.logger.log(
        `Scheduled cancellation review timeout for Request ${requestId} (Order #${orderNumber}) in ${delayMs / 1000 / 3600}h [Job: ${job.id}]`,
      );
      return job.id ?? jobId;
    } catch (err: unknown) {
      this.logger.error(
        `Failed to schedule cancellation review timeout for Request ${requestId}: ${err instanceof Error ? err.message : String(err)}`,
      );
      return jobId;
    }
  }

  async cancelCancellationReviewTimeout(requestId: string): Promise<boolean> {
    const jobId = `cancel-review-${requestId}`;
    try {
      const job = await this.cancellationReviewQueue.getJob(jobId);
      if (job) {
        await job.remove();
        this.logger.log(`Removed cancellation review timeout job [${jobId}]`);
        return true;
      }
      return false;
    } catch (err: unknown) {
      this.logger.warn(
        `Failed to remove cancellation review timeout job [${jobId}]: ${err instanceof Error ? err.message : String(err)}`,
      );
      return false;
    }
  }

  async scheduleDeliveryCompletion(
    orderId: string,
    orderNumber: string,
    delayMs: number = ORDER_TIMEOUT_MS.DELIVERY_COMPLETION,
  ): Promise<string> {
    const jobId = `delivery-complete-${orderId}`;
    try {
      const job = await this.deliveryCompletionQueue.add(
        OrderLifecycleJobName.AUTO_COMPLETE_DELIVERY,
        { orderId, orderNumber },
        {
          jobId,
          delay: delayMs,
          ...ORDER_LIFECYCLE_JOB_RETENTION,
        },
      );
      this.logger.log(
        `Scheduled delivery auto-complete for Order #${orderNumber} in ${delayMs / 1000 / 3600 / 24}d [Job: ${job.id}]`,
      );
      return job.id ?? jobId;
    } catch (err: unknown) {
      this.logger.error(
        `Failed to schedule delivery auto-complete for Order #${orderNumber}: ${err instanceof Error ? err.message : String(err)}`,
      );
      return jobId;
    }
  }

  async cancelDeliveryCompletion(orderId: string): Promise<boolean> {
    const jobId = `delivery-complete-${orderId}`;
    try {
      const job = await this.deliveryCompletionQueue.getJob(jobId);
      if (job) {
        await job.remove();
        this.logger.log(
          `Removed delivery auto-complete job [${jobId}] for Order ${orderId}`,
        );
        return true;
      }
      return false;
    } catch (err: unknown) {
      this.logger.warn(
        `Failed to remove delivery auto-complete job [${jobId}]: ${err instanceof Error ? err.message : String(err)}`,
      );
      return false;
    }
  }

  async scheduleReturnDeadline(
    orderId: string,
    returnRequestId: string,
    orderNumber: string,
    delayMs: number = ORDER_TIMEOUT_MS.RETURN_SHIPMENT_DEADLINE,
  ): Promise<string> {
    const jobId = `return-deadline-${returnRequestId}`;
    try {
      const job = await this.returnDeadlineQueue.add(
        OrderLifecycleJobName.VOID_EXPIRED_RETURN,
        { orderId, returnRequestId, orderNumber },
        {
          jobId,
          delay: delayMs,
          ...ORDER_LIFECYCLE_JOB_RETENTION,
        },
      );
      this.logger.log(
        `Scheduled return shipment deadline for Return ${returnRequestId} in ${delayMs / 1000 / 3600 / 24}d [Job: ${job.id}]`,
      );
      return job.id ?? jobId;
    } catch (err: unknown) {
      this.logger.error(
        `Failed to schedule return shipment deadline: ${err instanceof Error ? err.message : String(err)}`,
      );
      return jobId;
    }
  }

  async cancelReturnDeadline(returnRequestId: string): Promise<boolean> {
    const jobId = `return-deadline-${returnRequestId}`;
    try {
      const job = await this.returnDeadlineQueue.getJob(jobId);
      if (job) {
        await job.remove();
        this.logger.log(`Removed return shipment deadline job [${jobId}]`);
        return true;
      }
      return false;
    } catch (err: unknown) {
      this.logger.warn(
        `Failed to remove return shipment deadline job [${jobId}]: ${err instanceof Error ? err.message : String(err)}`,
      );
      return false;
    }
  }
}
