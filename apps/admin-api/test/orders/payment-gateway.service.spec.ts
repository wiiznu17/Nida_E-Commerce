import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PaymentGatewayService } from '../../src/modules/orders/payment-gateway/payment-gateway.service.js';
import { MockPaymentGatewayProvider } from '../../src/modules/orders/payment-gateway/mock-payment-gateway.provider.js';
import { OmisePaymentGatewayProvider } from '../../src/modules/orders/payment-gateway/omise-payment-gateway.provider.js';
import { PaymentMethod, PaymentStatus, OrderStatus } from '@repo/types';

describe('PaymentGatewayService', () => {
  let service: PaymentGatewayService;
  let mockProvider: MockPaymentGatewayProvider;
  let omiseProvider: OmisePaymentGatewayProvider;
  let prismaMock: Record<string, unknown>;
  let configMock: Record<string, unknown>;

  beforeEach(() => {
    process.env.PAYMENT_GATEWAY_PROVIDER = 'mock';

    mockProvider = new MockPaymentGatewayProvider();
    omiseProvider = new OmisePaymentGatewayProvider();

    prismaMock = {
      payment: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      order: {
        update: vi.fn(),
      },
      $transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) =>
        cb(prismaMock),
      ),
    };

    service = new PaymentGatewayService(
      mockProvider,
      omiseProvider,
      prismaMock as any,
    );
  });

  it('should initialize with mock provider by default', () => {
    expect(service.getActiveProviderName()).toBe('mock');
  });

  it('should switch to omise provider when PAYMENT_GATEWAY_PROVIDER=omise', () => {
    process.env.PAYMENT_GATEWAY_PROVIDER = 'omise';
    const omiseService = new PaymentGatewayService(
      mockProvider,
      omiseProvider,
      prismaMock as any,
    );
    expect(omiseService.getActiveProviderName()).toBe('omise');
  });

  it('should generate PromptPay intent with QR code', async () => {
    const intent = await service.createPaymentIntent({
      orderId: 'ord-1',
      orderNumber: 'NIDA-TEST-1',
      amount: 1500,
      paymentMethod: PaymentMethod.PROMPTPAY,
    });

    expect(intent.transactionReference).toBeDefined();
    expect(intent.status).toBe(PaymentStatus.PENDING);
    expect(intent.qrCodeUrl).toBeDefined();
  });

  it('should process webhook and update order to PAID', async () => {
    (prismaMock.payment as any).findFirst.mockResolvedValue({
      id: 'pay-1',
      orderId: 'ord-1',
      transactionReference: 'MOCK-PAY-123',
      gatewayEventId: 'OLD-EVENT',
      order: { id: 'ord-1', hasPreorderItems: false },
    });

    const res = await service.handleWebhook({
      transactionReference: 'MOCK-PAY-123',
      eventId: 'EVNT-NEW-1',
    });

    expect(res.success).toBe(true);
    expect((prismaMock.payment as any).update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'pay-1' },
        data: expect.objectContaining({
          status: PaymentStatus.CAPTURED,
          gatewayEventId: 'EVNT-NEW-1',
        }),
      }),
    );
    expect((prismaMock.order as any).update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ord-1' },
        data: { status: OrderStatus.PAID },
      }),
    );
  });

  it('should skip duplicate payment webhook idempotently', async () => {
    (prismaMock.payment as any).findFirst.mockResolvedValue({
      id: 'pay-1',
      orderId: 'ord-1',
      transactionReference: 'MOCK-PAY-123',
      gatewayEventId: 'EVNT-SAME-1',
      order: { id: 'ord-1', hasPreorderItems: false },
    });

    const res = await service.handleWebhook({
      transactionReference: 'MOCK-PAY-123',
      eventId: 'EVNT-SAME-1',
    });

    expect(res.success).toBe(true);
    expect(res.message).toContain('Duplicate');
    expect((prismaMock.payment as any).update).not.toHaveBeenCalled();
  });
});
