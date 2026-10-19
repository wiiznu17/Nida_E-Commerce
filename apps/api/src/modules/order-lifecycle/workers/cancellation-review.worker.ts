import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  OrderLifecycleQueueName,
  OrderLifecycleJobName,
  type AutoApproveCancellationJobData,
} from '@repo/types';
import {
  OrderStatus,
  PaymentStatus,
  RefundStatus,
  StockChangeType,
  AuditActionType,
} from '@repo/database';
import { PrismaService } from '../../../core/prisma/prisma.service.js';
import { OmiseService } from '../../orders/omise.service.js';

@Processor(OrderLifecycleQueueName.CANCELLATION_REVIEW)
@Injectable()
export class CancellationReviewWorker extends WorkerHost {
  private readonly logger = new Logger(CancellationReviewWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly omiseService: OmiseService,
  ) {
    super();
  }

  async process(job: Job<AutoApproveCancellationJobData>): Promise<void> {
    if (job.name !== OrderLifecycleJobName.AUTO_APPROVE_CANCELLATION) {
      return;
    }

    const { requestId, orderNumber } = job.data;
    this.logger.log(
      `Executing cancellation review timeout for Request ${requestId} (Order #${orderNumber})`,
    );

    const request = await this.prisma.orderCancellationRequest.findUnique({
      where: { id: requestId },
      include: {
        order: {
          include: {
            items: true,
            payment: true,
            refunds: true,
          },
        },
      },
    });

    if (!request) {
      this.logger.warn(`Cancellation request ${requestId} not found`);
      return;
    }

    if (request.status !== 'PENDING') {
      this.logger.log(
        `Cancellation request ${requestId} is already resolved (${request.status}). Skipping auto-approval.`,
      );
      return;
    }

    const order = request.order;
    if (
      !order ||
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.REFUNDED
    ) {
      this.logger.log(
        `Order #${orderNumber} is already in terminal status ${order?.status}. Skipping.`,
      );
      return;
    }

    await this.prisma.orderCancellationRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        adminNote: 'Auto-approved due to 48-hour review timeout',
        reviewedAt: new Date(),
        reviewedBy: null,
      },
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.CANCELLED },
    });

    for (const item of order.items) {
      if (!item.variantId) {
        continue;
      }

      if (item.isPreorder) {
        await this.prisma.inventoryItem.updateMany({
          where: { variantId: item.variantId },
          data: { preorderBooked: { decrement: item.quantity } },
        });
      } else {
        await this.prisma.inventoryItem.updateMany({
          where: { variantId: item.variantId },
          data: { quantityAvailable: { increment: item.quantity } },
        });

        const updatedInv = await this.prisma.inventoryItem.findUnique({
          where: { variantId: item.variantId },
          select: { quantityAvailable: true },
        });

        await this.prisma.stockMovement.create({
          data: {
            variantId: item.variantId,
            changeType: StockChangeType.RESTOCK,
            quantityChange: item.quantity,
            balanceAfter: updatedInv?.quantityAvailable ?? 0,
            reasonNote: `Auto-approved cancellation timeout #${order.orderNumber}`,
          },
        });
      }
    }

    if (order.couponId) {
      await this.prisma.couponRedemption.deleteMany({
        where: { orderId: order.id },
      });

      await this.prisma.promotionCoupon.update({
        where: { id: order.couponId },
        data: { currentUsageCount: { decrement: 1 } },
      });
    }

    if (order.payment && order.payment.status === PaymentStatus.CAPTURED) {
      const chargeId = order.payment.transactionReference;
      let gatewayRefundId: string | null = null;

      if (chargeId) {
        try {
          const refundResult = await this.omiseService.createRefund(
            chargeId,
            Number(order.totalAmount),
          );
          gatewayRefundId = refundResult.id;
        } catch (err: unknown) {
          this.logger.warn(
            `Automated Omise refund request for charge ${chargeId} failed: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }

      const refundCount = order.refunds?.length ?? 0;
      await this.prisma.refund.create({
        data: {
          refundNumber: `REF-${order.orderNumber}-${refundCount + 1}`,
          paymentId: order.payment.id,
          orderId: order.id,
          amount: order.totalAmount,
          reason: 'Auto-approved cancellation timeout (48h)',
          gatewayRefundId,
          status: RefundStatus.SUCCEEDED,
        },
      });

      await this.prisma.payment.update({
        where: { id: order.payment.id },
        data: { status: PaymentStatus.REFUNDED },
      });
    }

    await this.prisma.adminAuditLog.create({
      data: {
        actionType: AuditActionType.REFUND,
        targetTable: 'orders',
        targetId: order.id,
        performedRole: 'SYSTEM_WORKER',
        newValuesJson: {
          orderNumber: order.orderNumber,
          action: 'AUTO_APPROVE_CANCELLATION',
          requestId,
          reason: '48-hour cancellation review timeout expired',
        },
      },
    });

    this.logger.log(
      `Successfully auto-approved cancellation for Order #${orderNumber} (Request ${requestId})`,
    );
  }
}
