import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderLifecycleProducerService } from '../../src/modules/order-lifecycle/order-lifecycle-producer.service.js';
import {
  OrderLifecycleJobName,
  ORDER_TIMEOUT_MS,
  ORDER_LIFECYCLE_JOB_RETENTION,
} from '@repo/types';
import type { Queue, Job } from 'bullmq';

describe('OrderLifecycleProducerService — BullMQ Queue Producer', () => {
  let service: OrderLifecycleProducerService;

  let orderTimeoutQueueMock: {
    add: ReturnType<typeof vi.fn>;
    getJob: ReturnType<typeof vi.fn>;
  };
  let cancellationReviewQueueMock: {
    add: ReturnType<typeof vi.fn>;
    getJob: ReturnType<typeof vi.fn>;
  };
  let deliveryCompletionQueueMock: {
    add: ReturnType<typeof vi.fn>;
    getJob: ReturnType<typeof vi.fn>;
  };
  let returnDeadlineQueueMock: {
    add: ReturnType<typeof vi.fn>;
    getJob: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    orderTimeoutQueueMock = {
      add: vi.fn(),
      getJob: vi.fn(),
    };
    cancellationReviewQueueMock = {
      add: vi.fn(),
      getJob: vi.fn(),
    };
    deliveryCompletionQueueMock = {
      add: vi.fn(),
      getJob: vi.fn(),
    };
    returnDeadlineQueueMock = {
      add: vi.fn(),
      getJob: vi.fn(),
    };

    service = new OrderLifecycleProducerService(
      orderTimeoutQueueMock as unknown as Queue,
      cancellationReviewQueueMock as unknown as Queue,
      deliveryCompletionQueueMock as unknown as Queue,
      returnDeadlineQueueMock as unknown as Queue,
    );
  });

  describe('scheduleOrderTimeout & cancelOrderTimeout', () => {
    it('should schedule unpaid order timeout with default 15m PromptPay delay and deterministic jobId', async () => {
      const mockJob = { id: 'order-timeout-order-123' };
      orderTimeoutQueueMock.add.mockResolvedValue(mockJob as Job);

      const result = await service.scheduleOrderTimeout(
        'order-123',
        'ORD-2026-0001',
      );

      expect(result).toBe('order-timeout-order-123');
      expect(orderTimeoutQueueMock.add).toHaveBeenCalledWith(
        OrderLifecycleJobName.AUTO_CANCEL_ORDER,
        { orderId: 'order-123', orderNumber: 'ORD-2026-0001' },
        {
          jobId: 'order-timeout-order-123',
          delay: ORDER_TIMEOUT_MS.PROMPTPAY,
          ...ORDER_LIFECYCLE_JOB_RETENTION,
        },
      );
    });

    it('should allow custom delay (e.g. 30m Credit Card delay)', async () => {
      const mockJob = { id: 'order-timeout-order-456' };
      orderTimeoutQueueMock.add.mockResolvedValue(mockJob as Job);

      const result = await service.scheduleOrderTimeout(
        'order-456',
        'ORD-2026-0002',
        ORDER_TIMEOUT_MS.CREDIT_CARD,
      );

      expect(result).toBe('order-timeout-order-456');
      expect(orderTimeoutQueueMock.add).toHaveBeenCalledWith(
        OrderLifecycleJobName.AUTO_CANCEL_ORDER,
        { orderId: 'order-456', orderNumber: 'ORD-2026-0002' },
        expect.objectContaining({
          delay: ORDER_TIMEOUT_MS.CREDIT_CARD,
        }),
      );
    });

    it('should handle queue rejection gracefully without crashing', async () => {
      orderTimeoutQueueMock.add.mockRejectedValue(
        new Error('Redis connection refused'),
      );

      const result = await service.scheduleOrderTimeout(
        'order-789',
        'ORD-2026-0003',
      );

      expect(result).toBe('order-timeout-order-789');
    });

    it('should cancel active order timeout job when payment completes', async () => {
      const mockJob = {
        id: 'order-timeout-order-123',
        remove: vi.fn().mockResolvedValue(undefined),
      };
      orderTimeoutQueueMock.getJob.mockResolvedValue(mockJob as unknown as Job);

      const removed = await service.cancelOrderTimeout('order-123');

      expect(removed).toBe(true);
      expect(orderTimeoutQueueMock.getJob).toHaveBeenCalledWith(
        'order-timeout-order-123',
      );
      expect(mockJob.remove).toHaveBeenCalled();
    });

    it('should return false if order timeout job does not exist', async () => {
      orderTimeoutQueueMock.getJob.mockResolvedValue(null);

      const removed = await service.cancelOrderTimeout('order-999');

      expect(removed).toBe(false);
    });
  });

  describe('scheduleCancellationReviewTimeout & cancelCancellationReviewTimeout', () => {
    it('should schedule cancellation review timeout with default 48h delay', async () => {
      const mockJob = { id: 'cancel-review-req-101' };
      cancellationReviewQueueMock.add.mockResolvedValue(mockJob as Job);

      const result = await service.scheduleCancellationReviewTimeout(
        'order-101',
        'req-101',
        'ORD-2026-0101',
      );

      expect(result).toBe('cancel-review-req-101');
      expect(cancellationReviewQueueMock.add).toHaveBeenCalledWith(
        OrderLifecycleJobName.AUTO_APPROVE_CANCELLATION,
        {
          orderId: 'order-101',
          requestId: 'req-101',
          orderNumber: 'ORD-2026-0101',
        },
        {
          jobId: 'cancel-review-req-101',
          delay: ORDER_TIMEOUT_MS.CANCELLATION_REVIEW,
          ...ORDER_LIFECYCLE_JOB_RETENTION,
        },
      );
    });

    it('should cancel cancellation review job when admin reviews request', async () => {
      const mockJob = {
        id: 'cancel-review-req-101',
        remove: vi.fn().mockResolvedValue(undefined),
      };
      cancellationReviewQueueMock.getJob.mockResolvedValue(
        mockJob as unknown as Job,
      );

      const removed = await service.cancelCancellationReviewTimeout('req-101');

      expect(removed).toBe(true);
      expect(mockJob.remove).toHaveBeenCalled();
    });
  });

  describe('scheduleDeliveryCompletion & cancelDeliveryCompletion', () => {
    it('should schedule delivery auto-completion with default 5-day delay', async () => {
      const mockJob = { id: 'delivery-complete-order-202' };
      deliveryCompletionQueueMock.add.mockResolvedValue(mockJob as Job);

      const result = await service.scheduleDeliveryCompletion(
        'order-202',
        'ORD-2026-0202',
      );

      expect(result).toBe('delivery-complete-order-202');
      expect(deliveryCompletionQueueMock.add).toHaveBeenCalledWith(
        OrderLifecycleJobName.AUTO_COMPLETE_DELIVERY,
        { orderId: 'order-202', orderNumber: 'ORD-2026-0202' },
        {
          jobId: 'delivery-complete-order-202',
          delay: ORDER_TIMEOUT_MS.DELIVERY_COMPLETION,
          ...ORDER_LIFECYCLE_JOB_RETENTION,
        },
      );
    });

    it('should cancel delivery completion job when customer accepts delivery manually', async () => {
      const mockJob = {
        id: 'delivery-complete-order-202',
        remove: vi.fn().mockResolvedValue(undefined),
      };
      deliveryCompletionQueueMock.getJob.mockResolvedValue(
        mockJob as unknown as Job,
      );

      const removed = await service.cancelDeliveryCompletion('order-202');

      expect(removed).toBe(true);
      expect(mockJob.remove).toHaveBeenCalled();
    });
  });

  describe('scheduleReturnDeadline & cancelReturnDeadline', () => {
    it('should schedule return shipment deadline with default 7-day delay', async () => {
      const mockJob = { id: 'return-deadline-ret-303' };
      returnDeadlineQueueMock.add.mockResolvedValue(mockJob as Job);

      const result = await service.scheduleReturnDeadline(
        'order-303',
        'ret-303',
        'ORD-2026-0303',
      );

      expect(result).toBe('return-deadline-ret-303');
      expect(returnDeadlineQueueMock.add).toHaveBeenCalledWith(
        OrderLifecycleJobName.VOID_EXPIRED_RETURN,
        {
          orderId: 'order-303',
          returnRequestId: 'ret-303',
          orderNumber: 'ORD-2026-0303',
        },
        {
          jobId: 'return-deadline-ret-303',
          delay: ORDER_TIMEOUT_MS.RETURN_SHIPMENT_DEADLINE,
          ...ORDER_LIFECYCLE_JOB_RETENTION,
        },
      );
    });

    it('should cancel return deadline job when customer provides return tracking number', async () => {
      const mockJob = {
        id: 'return-deadline-ret-303',
        remove: vi.fn().mockResolvedValue(undefined),
      };
      returnDeadlineQueueMock.getJob.mockResolvedValue(
        mockJob as unknown as Job,
      );

      const removed = await service.cancelReturnDeadline('ret-303');

      expect(removed).toBe(true);
      expect(mockJob.remove).toHaveBeenCalled();
    });
  });
});
