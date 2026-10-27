import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  OrderLifecycleQueueName,
  OrderLifecycleJobName,
  DEFAULT_BULLMQ_WORKER_OPTIONS,
  type VoidExpiredReturnJobData,
} from '@repo/types';
import { AuditActionType } from '@repo/database';
import { PrismaService } from '../../../core/prisma/prisma.service.js';

@Processor(
  OrderLifecycleQueueName.RETURN_DEADLINE,
  DEFAULT_BULLMQ_WORKER_OPTIONS,
)
@Injectable()
export class ReturnShipmentWorker extends WorkerHost {
  private readonly logger = new Logger(ReturnShipmentWorker.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<VoidExpiredReturnJobData>): Promise<void> {
    if (job.name !== OrderLifecycleJobName.VOID_EXPIRED_RETURN) {
      return;
    }

    const { returnRequestId, orderNumber } = job.data;
    this.logger.log(
      `Executing return shipment deadline expiration for Request ${returnRequestId} (Order #${orderNumber})`,
    );

    const request = await this.prisma.returnRequest.findUnique({
      where: { id: returnRequestId },
      include: { order: true },
    });

    if (!request) {
      this.logger.warn(`Return request ${returnRequestId} not found`);
      return;
    }

    if (request.status !== 'APPROVED') {
      this.logger.log(
        `Return request ${returnRequestId} status is ${request.status} (not APPROVED). Skipping expiration.`,
      );
      return;
    }

    await this.prisma.returnRequest.update({
      where: { id: returnRequestId },
      data: {
        status: 'REJECTED',
        adminNote:
          'คำขอคืนสินค้านี้หมดอายุเนื่องจากไม่ได้รับข้อมูลพัสดุส่งคืนภายใน 7 วัน (Expired: 7-day return shipment deadline passed)',
        reviewedAt: new Date(),
      },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        actionType: AuditActionType.UPDATE,
        targetTable: 'return_requests',
        targetId: returnRequestId,
        performedRole: 'SYSTEM_WORKER',
        newValuesJson: {
          requestNumber: request.requestNumber,
          status: 'REJECTED',
          reason: '7-day return shipment window expired',
        },
      },
    });

    this.logger.log(
      `Successfully voided expired return request ${request.requestNumber} for Order #${orderNumber}`,
    );
  }
}
