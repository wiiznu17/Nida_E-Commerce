import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReturnShipmentWorker } from '../../src/modules/order-lifecycle/workers/return-shipment.worker.js';
import {
  OrderLifecycleJobName,
  type VoidExpiredReturnJobData,
} from '@repo/types';
import { AuditActionType } from '@repo/database';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { Job } from 'bullmq';

describe('ReturnShipmentWorker — BullMQ 7-Day Return Shipment Deadline Expiration', () => {
  let worker: ReturnShipmentWorker;
  let prismaMock: {
    returnRequest: {
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    adminAuditLog: {
      create: ReturnType<typeof vi.fn>;
    };
  };

  const createMockJob = (
    data: VoidExpiredReturnJobData,
    name = OrderLifecycleJobName.VOID_EXPIRED_RETURN,
  ): Job<VoidExpiredReturnJobData> =>
    ({
      name,
      data,
    } as unknown as Job<VoidExpiredReturnJobData>);

  beforeEach(() => {
    prismaMock = {
      returnRequest: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      adminAuditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
      },
    };

    worker = new ReturnShipmentWorker(prismaMock as unknown as PrismaService);
  });

  it('ignores jobs with unhandled job names', async () => {
    const job = createMockJob(
      { orderId: 'ord-1', returnRequestId: 'ret-1', orderNumber: 'NIDA-001' },
      'unhandled-job' as any,
    );

    await worker.process(job);

    expect(prismaMock.returnRequest.findUnique).not.toHaveBeenCalled();
  });

  it('skips processing if return request is not found', async () => {
    prismaMock.returnRequest.findUnique.mockResolvedValue(null);
    const job = createMockJob({
      orderId: 'ord-1',
      returnRequestId: 'ret-404',
      orderNumber: 'NIDA-404',
    });

    await worker.process(job);

    expect(prismaMock.returnRequest.update).not.toHaveBeenCalled();
  });

  it('skips processing if return request is not in APPROVED status (e.g. already COMPLETED or REJECTED)', async () => {
    prismaMock.returnRequest.findUnique.mockResolvedValue({
      id: 'ret-completed',
      status: 'COMPLETED',
      order: { id: 'ord-1', orderNumber: 'NIDA-001' },
    });

    const job = createMockJob({
      orderId: 'ord-1',
      returnRequestId: 'ret-completed',
      orderNumber: 'NIDA-001',
    });

    await worker.process(job);

    expect(prismaMock.returnRequest.update).not.toHaveBeenCalled();
  });

  it('successfully marks expired return request as REJECTED when 7-day shipment deadline passes and writes audit log', async () => {
    const mockReturn = {
      id: 'ret-approved-1',
      requestNumber: 'RET-20261017-001',
      status: 'APPROVED',
      order: { id: 'ord-1', orderNumber: 'NIDA-001' },
    };

    prismaMock.returnRequest.findUnique.mockResolvedValue(mockReturn);

    const job = createMockJob({
      orderId: 'ord-1',
      returnRequestId: 'ret-approved-1',
      orderNumber: 'NIDA-001',
    });

    await worker.process(job);

    expect(prismaMock.returnRequest.update).toHaveBeenCalledWith({
      where: { id: 'ret-approved-1' },
      data: expect.objectContaining({
        status: 'REJECTED',
        adminNote: expect.stringContaining('7-day return shipment deadline passed'),
        reviewedAt: expect.any(Date),
      }),
    });

    expect(prismaMock.adminAuditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actionType: AuditActionType.UPDATE,
        targetTable: 'return_requests',
        targetId: 'ret-approved-1',
        performedRole: 'SYSTEM_WORKER',
      }),
    });
  });
});
