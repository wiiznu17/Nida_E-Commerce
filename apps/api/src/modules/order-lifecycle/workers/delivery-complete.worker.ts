import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  OrderLifecycleQueueName,
  OrderLifecycleJobName,
  type AutoCompleteDeliveryJobData,
} from '@repo/types';
import {
  OrderStatus,
  PointChangeType,
  AuditActionType,
} from '@repo/database';
import { PrismaService } from '../../../core/prisma/prisma.service.js';

@Processor(OrderLifecycleQueueName.DELIVERY_COMPLETION)
@Injectable()
export class DeliveryCompleteWorker extends WorkerHost {
  private readonly logger = new Logger(DeliveryCompleteWorker.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<AutoCompleteDeliveryJobData>): Promise<void> {
    if (job.name !== OrderLifecycleJobName.AUTO_COMPLETE_DELIVERY) {
      return;
    }

    const { orderId, orderNumber } = job.data;
    this.logger.log(
      `Executing delivery auto-complete verification for Order #${orderNumber} (${orderId})`,
    );

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      this.logger.warn(`Order #${orderNumber} (${orderId}) not found during delivery auto-completion`);
      return;
    }

    if (order.status !== OrderStatus.DELIVERED) {
      this.logger.log(
        `Order #${orderNumber} is in status ${order.status} (not DELIVERED). Skipping delivery auto-completion.`,
      );
      return;
    }

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    if (order.userId) {
      const pointsToEarn = Math.floor(Number(order.totalAmount) / 100);
      if (pointsToEarn > 0) {
        try {
          const existingPoints = await this.prisma.pointTransaction.findFirst({
            where: {
              orderId: order.id,
              changeType: PointChangeType.EARNED_ORDER,
            },
          });

          if (!existingPoints) {
            const user = await this.prisma.user.findUnique({
              where: { id: order.userId },
              select: { points: true },
            });
            const currentPoints = user?.points ?? 0;
            const newBalance = currentPoints + pointsToEarn;

            await this.prisma.pointTransaction.create({
              data: {
                userId: order.userId,
                orderId: order.id,
                changeType: PointChangeType.EARNED_ORDER,
                pointsChange: pointsToEarn,
                balanceAfter: newBalance,
                description: `Loyalty points auto-awarded on delivery completion #${order.orderNumber}`,
              },
            });

            await this.prisma.user.update({
              where: { id: order.userId },
              data: { points: newBalance },
            });
          }
        } catch (err: unknown) {
          this.logger.warn(
            `Failed to credit loyalty points for completed order #${order.orderNumber}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
    }

    await this.prisma.adminAuditLog.create({
      data: {
        actionType: AuditActionType.STATUS_CHANGE,
        targetTable: 'orders',
        targetId: order.id,
        performedRole: 'SYSTEM_WORKER',
        newValuesJson: {
          orderNumber: order.orderNumber,
          status: OrderStatus.COMPLETED,
          reason: '5-day auto-complete after delivery',
        },
      },
    });

    this.logger.log(
      `Successfully transitioned Order #${orderNumber} to COMPLETED (5-day auto-acceptance).`,
    );
  }
}
