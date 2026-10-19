import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeliveryCompleteWorker } from '../../src/modules/order-lifecycle/workers/delivery-complete.worker.js';
import {
  OrderLifecycleJobName,
  type AutoCompleteDeliveryJobData,
} from '@repo/types';
import {
  OrderStatus,
  PointChangeType,
  AuditActionType,
} from '@repo/database';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { Job } from 'bullmq';

describe('DeliveryCompleteWorker — BullMQ 5-Day Delivery Auto-Completion & Loyalty Points', () => {
  let worker: DeliveryCompleteWorker;
  let prismaMock: {
    order: {
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    pointTransaction: {
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
    user: {
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    adminAuditLog: {
      create: ReturnType<typeof vi.fn>;
    };
  };

  const createMockJob = (
    data: AutoCompleteDeliveryJobData,
    name = OrderLifecycleJobName.AUTO_COMPLETE_DELIVERY,
  ): Job<AutoCompleteDeliveryJobData> =>
    ({
      name,
      data,
    } as unknown as Job<AutoCompleteDeliveryJobData>);

  beforeEach(() => {
    prismaMock = {
      order: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      pointTransaction: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'pt-1' }),
      },
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: 'usr-1', points: 100 }),
        update: vi.fn().mockResolvedValue({ id: 'usr-1', points: 125 }),
      },
      adminAuditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
      },
    };

    worker = new DeliveryCompleteWorker(prismaMock as unknown as PrismaService);
  });

  it('ignores jobs with unhandled job names', async () => {
    const job = createMockJob({ orderId: 'ord-1', orderNumber: 'NIDA-001' }, 'other-job' as any);

    await worker.process(job);

    expect(prismaMock.order.findUnique).not.toHaveBeenCalled();
  });

  it('skips processing if order is not found', async () => {
    prismaMock.order.findUnique.mockResolvedValue(null);
    const job = createMockJob({ orderId: 'ord-404', orderNumber: 'NIDA-404' });

    await worker.process(job);

    expect(prismaMock.order.update).not.toHaveBeenCalled();
  });

  it('skips processing if order is not in DELIVERED status (e.g. already COMPLETED or SHIPPED)', async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: 'ord-already-completed',
      status: OrderStatus.COMPLETED,
    });

    const job = createMockJob({ orderId: 'ord-already-completed', orderNumber: 'NIDA-001' });

    await worker.process(job);

    expect(prismaMock.order.update).not.toHaveBeenCalled();
    expect(prismaMock.pointTransaction.create).not.toHaveBeenCalled();
  });

  it('auto-completes DELIVERED order after 5 days, records completedAt, and awards loyalty points', async () => {
    const mockOrder = {
      id: 'ord-delivered-1',
      orderNumber: 'NIDA-20261017-DELV01',
      status: OrderStatus.DELIVERED,
      userId: 'usr-1',
      totalAmount: 2500, // 25 points
    };

    prismaMock.order.findUnique.mockResolvedValue(mockOrder);

    const job = createMockJob({
      orderId: 'ord-delivered-1',
      orderNumber: 'NIDA-20261017-DELV01',
    });

    await worker.process(job);

    // 1. Order transitioned to COMPLETED
    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: 'ord-delivered-1' },
      data: expect.objectContaining({
        status: OrderStatus.COMPLETED,
        completedAt: expect.any(Date),
      }),
    });

    // 2. Loyalty points awarded
    expect(prismaMock.pointTransaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'usr-1',
        orderId: 'ord-delivered-1',
        changeType: PointChangeType.EARNED_ORDER,
        pointsChange: 25,
        balanceAfter: 125,
      }),
    });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'usr-1' },
      data: { points: 125 },
    });

    // 3. Audit log recorded
    expect(prismaMock.adminAuditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actionType: AuditActionType.STATUS_CHANGE,
        targetTable: 'orders',
        targetId: 'ord-delivered-1',
        performedRole: 'SYSTEM_WORKER',
      }),
    });
  });

  it('idempotently avoids duplicate loyalty point award if points were already granted', async () => {
    const mockOrder = {
      id: 'ord-delivered-dup',
      orderNumber: 'NIDA-20261017-DELVDUP',
      status: OrderStatus.DELIVERED,
      userId: 'usr-1',
      totalAmount: 5000,
    };

    prismaMock.order.findUnique.mockResolvedValue(mockOrder);
    prismaMock.pointTransaction.findFirst.mockResolvedValue({ id: 'existing-pt' });

    const job = createMockJob({
      orderId: 'ord-delivered-dup',
      orderNumber: 'NIDA-20261017-DELVDUP',
    });

    await worker.process(job);

    expect(prismaMock.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: OrderStatus.COMPLETED }),
      }),
    );
    expect(prismaMock.pointTransaction.create).not.toHaveBeenCalled();
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('handles guest order without userId gracefully', async () => {
    const mockGuestOrder = {
      id: 'ord-delivered-guest',
      orderNumber: 'NIDA-20261017-GUEST',
      status: OrderStatus.DELIVERED,
      userId: null,
      totalAmount: 1800,
    };

    prismaMock.order.findUnique.mockResolvedValue(mockGuestOrder);

    const job = createMockJob({
      orderId: 'ord-delivered-guest',
      orderNumber: 'NIDA-20261017-GUEST',
    });

    await worker.process(job);

    expect(prismaMock.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: OrderStatus.COMPLETED }),
      }),
    );
    expect(prismaMock.pointTransaction.create).not.toHaveBeenCalled();
  });
});
