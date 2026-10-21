import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderTimeoutWorker } from '../../src/modules/order-lifecycle/workers/order-timeout.worker.js';
import {
  OrderLifecycleJobName,
  type AutoCancelOrderJobData,
} from '@repo/types';
import { OrderStatus, PaymentStatus, StockChangeType } from '@repo/database';
import type { PrismaService } from '../../src/core/prisma/prisma.service.js';
import type { Job } from 'bullmq';

describe('OrderTimeoutWorker — BullMQ Unpaid Order Auto-Cancel & Restock', () => {
  let worker: OrderTimeoutWorker;
  let prismaMock: {
    order: {
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    payment: {
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
    $transaction: ReturnType<typeof vi.fn>;
  };

  const createMockJob = (
    data: AutoCancelOrderJobData,
    name = OrderLifecycleJobName.AUTO_CANCEL_ORDER,
  ): Job<AutoCancelOrderJobData> =>
    ({
      name,
      data,
    }) as unknown as Job<AutoCancelOrderJobData>;

  beforeEach(() => {
    prismaMock = {
      order: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      payment: {
        update: vi.fn(),
      },
      inventoryItem: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findUnique: vi.fn().mockResolvedValue({ quantityAvailable: 10 }),
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
      $transaction: vi.fn(
        async (cb: (tx: typeof prismaMock) => Promise<unknown>) =>
          cb(prismaMock),
      ),
    };

    worker = new OrderTimeoutWorker(prismaMock as unknown as PrismaService);
  });

  it('ignores jobs with unhandled job names', async () => {
    const job = createMockJob(
      { orderId: 'ord-1', orderNumber: 'NIDA-001' },
      'unrecognized-job' as any,
    );

    await worker.process(job);

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('skips processing if order is not found in database', async () => {
    prismaMock.order.findUnique.mockResolvedValue(null);
    const job = createMockJob({
      orderId: 'ord-non-existent',
      orderNumber: 'NIDA-404',
    });

    await worker.process(job);

    expect(prismaMock.order.update).not.toHaveBeenCalled();
    expect(prismaMock.stockMovement.create).not.toHaveBeenCalled();
  });

  it('guarantees payment-success-wins (skips cancellation if order is already PAID or settled)', async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      id: 'ord-paid-1',
      orderNumber: 'NIDA-PAID-001',
      status: OrderStatus.PAID,
      items: [],
      payment: { id: 'pay-1', status: PaymentStatus.CAPTURED },
    });

    const job = createMockJob({
      orderId: 'ord-paid-1',
      orderNumber: 'NIDA-PAID-001',
    });

    await worker.process(job);

    expect(prismaMock.order.update).not.toHaveBeenCalled();
    expect(prismaMock.payment.update).not.toHaveBeenCalled();
    expect(prismaMock.inventoryItem.updateMany).not.toHaveBeenCalled();
    expect(prismaMock.stockMovement.create).not.toHaveBeenCalled();
  });

  it('successfully auto-cancels unpaid PENDING order, fails payment, restocks inventory, and restores coupons', async () => {
    const mockOrder = {
      id: 'ord-pending-1',
      orderNumber: 'NIDA-PENDING-001',
      status: OrderStatus.PENDING,
      couponId: 'coupon-vip',
      payment: {
        id: 'pay-pending-1',
        status: PaymentStatus.PENDING,
      },
      items: [
        {
          id: 'item-1',
          variantId: 'variant-1',
          quantity: 2,
          isPreorder: false,
        },
        {
          id: 'item-2',
          variantId: 'variant-2-preorder',
          quantity: 1,
          isPreorder: true,
        },
      ],
    };

    prismaMock.order.findUnique.mockResolvedValue(mockOrder);

    const job = createMockJob({
      orderId: 'ord-pending-1',
      orderNumber: 'NIDA-PENDING-001',
      reason: 'PromptPay 15m timeout expired',
    });

    await worker.process(job);

    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: 'ord-pending-1' },
      data: { status: OrderStatus.CANCELLED },
    });

    expect(prismaMock.payment.update).toHaveBeenCalledWith({
      where: { id: 'pay-pending-1' },
      data: { status: PaymentStatus.FAILED },
    });

    // In-stock item restocked
    expect(prismaMock.inventoryItem.updateMany).toHaveBeenCalledWith({
      where: { variantId: 'variant-1' },
      data: { quantityAvailable: { increment: 2 } },
    });
    expect(prismaMock.stockMovement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        variantId: 'variant-1',
        changeType: StockChangeType.RESTOCK,
        quantityChange: 2,
        reasonNote: 'PromptPay 15m timeout expired',
      }),
    });

    // Preorder item release
    expect(prismaMock.inventoryItem.updateMany).toHaveBeenCalledWith({
      where: { variantId: 'variant-2-preorder' },
      data: { preorderBooked: { decrement: 1 } },
    });

    // Coupon restored
    expect(prismaMock.couponRedemption.deleteMany).toHaveBeenCalledWith({
      where: { orderId: 'ord-pending-1' },
    });
    expect(prismaMock.promotionCoupon.update).toHaveBeenCalledWith({
      where: { id: 'coupon-vip' },
      data: { currentUsageCount: { decrement: 1 } },
    });
  });
});
