import { Injectable } from '@nestjs/common';
import { PaymentMethod, PaymentStatus, RefundStatus } from '@repo/types';
import type {
  IPaymentGatewayProvider,
  CreatePaymentIntentInput,
  CreatePaymentIntentResult,
  CreateRefundInput,
  CreateRefundResult,
  ParsedPaymentWebhook,
} from './payment-gateway.interface.js';

@Injectable()
export class MockPaymentGatewayProvider implements IPaymentGatewayProvider {
  readonly providerName = 'mock';

  async createPaymentIntent(
    input: CreatePaymentIntentInput,
  ): Promise<CreatePaymentIntentResult> {
    const reference = `MOCK-PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    if (input.paymentMethod === PaymentMethod.PROMPTPAY) {
      return {
        transactionReference: reference,
        status: PaymentStatus.PENDING,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PROMPTPAY-MOCK-${input.amount}-${input.orderNumber}`,
        expiresAt,
      };
    }

    if (input.paymentMethod === PaymentMethod.CREDIT_CARD) {
      return {
        transactionReference: reference,
        status: PaymentStatus.CAPTURED,
        expiresAt,
      };
    }

    return {
      transactionReference: reference,
      status: PaymentStatus.PENDING,
      expiresAt,
    };
  }

  async checkPaymentStatus(): Promise<PaymentStatus> {
    return PaymentStatus.CAPTURED;
  }

  async createRefund(input: CreateRefundInput): Promise<CreateRefundResult> {
    return {
      gatewayRefundId: `MOCK-RFD-${Date.now()}`,
      status: RefundStatus.SUCCEEDED,
    };
  }

  async parseWebhook(payload: unknown): Promise<ParsedPaymentWebhook | null> {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const body = payload as Record<string, unknown>;
    const transactionReference =
      typeof body.transactionReference === 'string'
        ? body.transactionReference
        : `MOCK-PAY-${Date.now()}`;

    const gatewayEventId =
      typeof body.eventId === 'string' ? body.eventId : `EVNT-${Date.now()}`;

    return {
      transactionReference,
      gatewayEventId,
      paymentStatus: PaymentStatus.CAPTURED,
      isSuccessful: true,
      paidAt: new Date(),
      cardLast4: '4242',
      cardBrand: 'Visa',
    };
  }
}
