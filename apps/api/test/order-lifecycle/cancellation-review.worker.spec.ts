import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CancellationReviewWorker } from '../../src/modules/order-lifecycle/workers/cancellation-review.worker.js';
import {
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
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { OmiseService } from '../../src/modules/orders/omise.service.js';
import type { Job } from 'bullmq';

describe('CancellationReviewWorker — BullMQ Pre-Fulfillment 48h Auto-Approval & Refund', () => {
  let worker: CancellationReviewWorker;
  let prismaMock: {
    orderCancellationRequest: {
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    order: {
      update: ReturnType<typeof vi.fn>;
    };
    inventoryItem: {
      updateMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
    };
    stockMovement: {
      create: ReturnType<typeof vi.fn>;
    };
    couponRedemption: {
      deleteMany: ReturnType<typeof vi.fn>;
    };
    promotionCoupon: {
      update: ReturnType<typeof vi.fn>;
    };
    refund: {
      create: ReturnType<typeof vi.fn>;
    };
    payment: {
      update: ReturnType<typeof vi.fn>;
    };
    adminAuditLog: {
      create: ReturnType<typeof vi.fn>;
    };
  };

  let omiseMock: {
    createRefund: ReturnType<typeof vi.fn>;
  };

  const createMockJob = (
    data: AutoApproveCancellationJobData,
    name = OrderLifecycleJobName.AUTO_APPROVE_CANCELLATION,
  ): Job<AutoApproveCancellationJobData> =>
    ({
      name,
      data,
    } as unknown as Job<AutoApproveCancellationJobData>);

  beforeEach(() => {
    prismaMock = {
      orderCancellationRequest: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      order: {
        update: vi.fn(),
      },
      inventoryItem: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findUnique: vi.fn().mockResolvedValue({ quantityAvailable: 5 }),
      },
      stockMovement: {
        create: vi.fn().mockResolvedValue({ id: 'sm-1' }),
      },
      couponRedemption: {
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      promotionCoupon: {
        update: vi.fn().mockResolvedValue({ id: 'cpn-1' }),
      },
      refund: {
        create: vi.fn().mockResolvedValue({ id: 'rf-1' }),
      },
      payment: {
        update: vi.fn().mockResolvedValue({ id: 'pay-1' }),
      },
      adminAuditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
      },
    };

    omiseMock = {
      createRefund: vi.fn().mockResolvedValue({ id: 'rfnd_test_auto_48h' }),
    };

    worker = new CancellationReviewWorker(
      prismaMock as unknown as PrismaService,
      omiseMock as unknown as OmiseService,
    );
  });

  it('ignores jobs with unhandled job names', async () => {
    const job = createMockJob(
      { orderId: 'ord-1', requestId: 'req-1', orderNumber: 'NIDA-001' },
      'other-job' as any,
    );

    await worker.process(job);

    expect(prismaMock.orderCancellationRequest.findUnique).not.toHaveBeenCalled();
  });

  it('skips processing if cancellation request is not found', async () => {
    prismaMock.orderCancellationRequest.findUnique.mockResolvedValue(null);
    const job = createMockJob({ orderId: 'ord-1', requestId: 'req-404', orderNumber: 'NIDA-404' });

    await worker.process(job);

    expect(prismaMock.orderCancellationRequest.update).not.toHaveBeenCalled();
    expect(omiseMock.createRefund).not.toHaveBeenCalled();
  });

  it('skips auto-approval if request status is already resolved (e.g. APPROVED or REJECTED by admin)', async () => {
    prismaMock.orderCancellationRequest.findUnique.mockResolvedValue({
      id: 'req-already',
      status: 'REJECTED',
      order: { id: 'ord-1', status: OrderStatus.PAID, items: [] },
    });

    const job = createMockJob({ orderId: 'ord-1', requestId: 'req-already', orderNumber: 'NIDA-001' });

    await worker.process(job);

    expect(prismaMock.orderCancellationRequest.update).not.toHaveBeenCalled();
    expect(omiseMock.createRefund).not.toHaveBeenCalled();
  });

  it('skips auto-approval if order is already CANCELLED or REFUNDED', async () => {
    prismaMock.orderCancellationRequest.findUnique.mockResolvedValue({
      id: 'req-cancelled-ord',
      status: 'PENDING',
      order: { id: 'ord-1', status: OrderStatus.CANCELLED, items: [] },
    });

    const job = createMockJob({ orderId: 'ord-1', requestId: 'req-cancelled-ord', orderNumber: 'NIDA-001' });

    await worker.process(job);

    expect(prismaMock.orderCancellationRequest.update).not.toHaveBeenCalled();
    expect(omiseMock.createRefund).not.toHaveBeenCalled();
  });

  it('auto-approves pending request, cancels order, restocks inventory, executes Omise refund, and writes audit log', async () => {
    const mockRequest = {
      id: 'req-pending-1',
      status: 'PENDING',
      order: {
        id: 'ord-paid-1',
        orderNumber: 'NIDA-20261017-0099',
        status: OrderStatus.PAID,
        totalAmount: 3200,
        couponId: 'cpn-1',
        payment: {
          id: 'pay-captured-1',
          status: PaymentStatus.CAPTURED,
          transactionReference: 'chrg_test_captured_123',
        },
        items: [
          {
            id: 'item-1',
            variantId: 'var-1',
            quantity: 1,
            isPreorder: false,
          },
        ],
        refunds: [],
      },
    };

    prismaMock.orderCancellationRequest.findUnique.mockResolvedValue(mockRequest);

    const job = createMockJob({
      orderId: 'ord-paid-1',
      requestId: 'req-pending-1',
      orderNumber: 'NIDA-20261017-0099',
    });

    await worker.process(job);

    // 1. Request marked APPROVED
    expect(prismaMock.orderCancellationRequest.update).toHaveBeenCalledWith({
      where: { id: 'req-pending-1' },
      data: expect.objectContaining({
        status: 'APPROVED',
        adminNote: 'Auto-approved due to 48-hour review timeout',
        reviewedBy: null,
      }),
    });

    // 2. Order updated to CANCELLED
    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: 'ord-paid-1' },
      data: { status: OrderStatus.CANCELLED },
    });

    // 3. Stock restocked
    expect(prismaMock.inventoryItem.updateMany).toHaveBeenCalledWith({
      where: { variantId: 'var-1' },
      data: { quantityAvailable: { increment: 1 } },
    });
    expect(prismaMock.stockMovement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        variantId: 'var-1',
        changeType: StockChangeType.RESTOCK,
        quantityChange: 1,
      }),
    });

    // 4. Omise refund invoked
    expect(omiseMock.createRefund).toHaveBeenCalledWith('chrg_test_captured_123', 3200);

    // 5. Refund record created
    expect(prismaMock.refund.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: 'ord-paid-1',
        paymentId: 'pay-captured-1',
        gatewayRefundId: 'rfnd_test_auto_48h',
        status: RefundStatus.SUCCEEDED,
      }),
    });

    // 6. Payment updated to REFUNDED
    expect(prismaMock.payment.update).toHaveBeenCalledWith({
      where: { id: 'pay-captured-1' },
      data: { status: PaymentStatus.REFUNDED },
    });

    // 7. Audit log written
    expect(prismaMock.adminAuditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actionType: AuditActionType.REFUND,
        targetTable: 'orders',
        targetId: 'ord-paid-1',
        performedRole: 'SYSTEM_WORKER',
      }),
    });
  });
});
