import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderLifecycleProducerService } from '../../src/modules/order-lifecycle/order-lifecycle-producer.service.js';
import { OrderLifecycleJobName, ORDER_TIMEOUT_MS } from '@repo/types';
import type { Queue, Job } from 'bullmq';

describe('OrderLifecycleProducerService (Admin Domain) — BullMQ Queue Producer', () => {
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
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    });

    it('should schedule order timeout with admin manual draft 24h delay', async () => {
      const mockJob = { id: 'order-timeout-order-draft' };
      orderTimeoutQueueMock.add.mockResolvedValue(mockJob as Job);

      const result = await service.scheduleOrderTimeout(
        'order-draft',
        'ORD-2026-DRAFT',
        ORDER_TIMEOUT_MS.ADMIN_MANUAL_DRAFT,
      );

      expect(result).toBe('order-timeout-order-draft');
      expect(orderTimeoutQueueMock.add).toHaveBeenCalledWith(
        OrderLifecycleJobName.AUTO_CANCEL_ORDER,
        { orderId: 'order-draft', orderNumber: 'ORD-2026-DRAFT' },
        expect.objectContaining({
          delay: ORDER_TIMEOUT_MS.ADMIN_MANUAL_DRAFT,
        }),
      );
    });

    it('should handle queue rejection gracefully without throwing uncaught exceptions', async () => {
      orderTimeoutQueueMock.add.mockRejectedValue(new Error('Redis timeout'));

      const result = await service.scheduleOrderTimeout(
        'order-789',
        'ORD-2026-0003',
      );

      expect(result).toBe('order-timeout-order-789');
    });

    it('should remove timeout job on payment confirmation', async () => {
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

    it('should return false if job is not found', async () => {
      orderTimeoutQueueMock.getJob.mockResolvedValue(null);

      const removed = await service.cancelOrderTimeout('order-not-found');

      expect(removed).toBe(false);
    });
  });

  describe('scheduleCancellationReviewTimeout & cancelCancellationReviewTimeout', () => {
    it('should schedule cancellation review timeout with default 48h delay', async () => {
      const mockJob = { id: 'cancel-review-req-505' };
      cancellationReviewQueueMock.add.mockResolvedValue(mockJob as Job);

      const result = await service.scheduleCancellationReviewTimeout(
        'order-505',
        'req-505',
        'ORD-2026-0505',
      );

      expect(result).toBe('cancel-review-req-505');
      expect(cancellationReviewQueueMock.add).toHaveBeenCalledWith(
        OrderLifecycleJobName.AUTO_APPROVE_CANCELLATION,
        {
          orderId: 'order-505',
          requestId: 'req-505',
          orderNumber: 'ORD-2026-0505',
        },
        {
          jobId: 'cancel-review-req-505',
          delay: ORDER_TIMEOUT_MS.CANCELLATION_REVIEW,
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    });

    it('should cancel review timeout job when admin approves or rejects request', async () => {
      const mockJob = {
        id: 'cancel-review-req-505',
        remove: vi.fn().mockResolvedValue(undefined),
      };
      cancellationReviewQueueMock.getJob.mockResolvedValue(
        mockJob as unknown as Job,
      );

      const removed = await service.cancelCancellationReviewTimeout('req-505');

      expect(removed).toBe(true);
      expect(mockJob.remove).toHaveBeenCalled();
    });
  });

  describe('scheduleDeliveryCompletion & cancelDeliveryCompletion', () => {
    it('should schedule delivery auto-completion with 5-day delay upon DELIVERED milestone', async () => {
      const mockJob = { id: 'delivery-complete-order-606' };
      deliveryCompletionQueueMock.add.mockResolvedValue(mockJob as Job);

      const result = await service.scheduleDeliveryCompletion(
        'order-606',
        'ORD-2026-0606',
      );

      expect(result).toBe('delivery-complete-order-606');
      expect(deliveryCompletionQueueMock.add).toHaveBeenCalledWith(
        OrderLifecycleJobName.AUTO_COMPLETE_DELIVERY,
        { orderId: 'order-606', orderNumber: 'ORD-2026-0606' },
        {
          jobId: 'delivery-complete-order-606',
          delay: ORDER_TIMEOUT_MS.DELIVERY_COMPLETION,
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    });

    it('should cancel delivery completion job when customer accepts manually', async () => {
      const mockJob = {
        id: 'delivery-complete-order-606',
        remove: vi.fn().mockResolvedValue(undefined),
      };
      deliveryCompletionQueueMock.getJob.mockResolvedValue(
        mockJob as unknown as Job,
      );

      const removed = await service.cancelDeliveryCompletion('order-606');

      expect(removed).toBe(true);
      expect(mockJob.remove).toHaveBeenCalled();
    });
  });

  describe('scheduleReturnDeadline & cancelReturnDeadline', () => {
    it('should schedule return shipment deadline with 7-day delay', async () => {
      const mockJob = { id: 'return-deadline-ret-707' };
      returnDeadlineQueueMock.add.mockResolvedValue(mockJob as Job);

      const result = await service.scheduleReturnDeadline(
        'order-707',
        'ret-707',
        'ORD-2026-0707',
      );

      expect(result).toBe('return-deadline-ret-707');
      expect(returnDeadlineQueueMock.add).toHaveBeenCalledWith(
        OrderLifecycleJobName.VOID_EXPIRED_RETURN,
        {
          orderId: 'order-707',
          returnRequestId: 'ret-707',
          orderNumber: 'ORD-2026-0707',
        },
        {
          jobId: 'return-deadline-ret-707',
          delay: ORDER_TIMEOUT_MS.RETURN_SHIPMENT_DEADLINE,
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    });

    it('should cancel return deadline job when customer ships return package', async () => {
      const mockJob = {
        id: 'return-deadline-ret-707',
        remove: vi.fn().mockResolvedValue(undefined),
      };
      returnDeadlineQueueMock.getJob.mockResolvedValue(
        mockJob as unknown as Job,
      );

      const removed = await service.cancelReturnDeadline('ret-707');

      expect(removed).toBe(true);
      expect(mockJob.remove).toHaveBeenCalled();
    });
  });
});
