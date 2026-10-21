import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  OrderLifecycleQueueName,
  OrderLifecycleJobName,
  type AutoCancelOrderJobData,
} from '@repo/types';
import { OrderStatus, PaymentStatus, StockChangeType } from '@repo/database';
import { PrismaService } from '../../../core/prisma/prisma.service.js';

@Processor(OrderLifecycleQueueName.ORDER_TIMEOUT)
@Injectable()
export class OrderTimeoutWorker extends WorkerHost {
  private readonly logger = new Logger(OrderTimeoutWorker.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<AutoCancelOrderJobData>): Promise<void> {
    if (job.name !== OrderLifecycleJobName.AUTO_CANCEL_ORDER) {
      return;
    }

    const { orderId, orderNumber, reason } = job.data;
    this.logger.log(
      `Executing unpaid timeout verification for Order #${orderNumber} (${orderId})`,
    );

    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          payment: true,
        },
      });

      if (!order) {
        this.logger.warn(
          `Order #${orderNumber} (${orderId}) not found during timeout execution`,
        );
        return;
      }

      if (order.status !== OrderStatus.PENDING) {
        this.logger.log(
          `Order #${orderNumber} is in status ${order.status} (no longer PENDING). Payment success wins; skipping cancellation.`,
        );
        return;
      }

      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELLED },
      });

      if (order.payment && order.payment.status === PaymentStatus.PENDING) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: { status: PaymentStatus.FAILED },
        });
      }

      for (const item of order.items) {
        if (!item.variantId) {
          continue;
        }

        if (item.isPreorder) {
          await tx.inventoryItem.updateMany({
            where: { variantId: item.variantId },
            data: { preorderBooked: { decrement: item.quantity } },
          });
        } else {
          await tx.inventoryItem.updateMany({
            where: { variantId: item.variantId },
            data: { quantityAvailable: { increment: item.quantity } },
          });

          const updatedInv = await tx.inventoryItem.findUnique({
            where: { variantId: item.variantId },
            select: { quantityAvailable: true },
          });

          await tx.stockMovement.create({
            data: {
              variantId: item.variantId,
              changeType: StockChangeType.RESTOCK,
              quantityChange: item.quantity,
              balanceAfter: updatedInv?.quantityAvailable ?? 0,
              reasonNote:
                reason ?? `Unpaid order timeout #${order.orderNumber}`,
            },
          });
        }
      }

      if (order.couponId) {
        await tx.couponRedemption.deleteMany({
          where: { orderId: order.id },
        });

        await tx.promotionCoupon.update({
          where: { id: order.couponId },
          data: { currentUsageCount: { decrement: 1 } },
        });
      }

      this.logger.log(
        `Successfully auto-cancelled unpaid Order #${orderNumber} and restocked inventory items.`,
      );
    });
  }
}
