import type { PaymentMethod, PaymentStatus, RefundStatus } from '@repo/types';

export interface CreatePaymentIntentInput {
  orderId: string;
  orderNumber: string;
  amount: number; // In THB
  currency?: string; // Default THB
  paymentMethod: PaymentMethod;
  cardToken?: string;
  customerEmail?: string;
  returnUri?: string;
}

export interface CreatePaymentIntentResult {
  transactionReference: string;
  status: PaymentStatus;
  qrCodeUrl?: string;
  authorizeUri?: string;
  expiresAt?: Date;
}

export interface CreateRefundInput {
  transactionReference: string;
  amount: number;
  reason?: string;
}

export interface CreateRefundResult {
  gatewayRefundId: string;
  status: RefundStatus;
}

export interface ParsedPaymentWebhook {
  transactionReference: string;
  gatewayEventId: string;
  paymentStatus: PaymentStatus;
  isSuccessful: boolean;
  paidAt?: Date;
  cardLast4?: string;
  cardBrand?: string;
}

export interface IPaymentGatewayProvider {
  readonly providerName: string;
  createPaymentIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentResult>;
  checkPaymentStatus(transactionReference: string): Promise<PaymentStatus>;
  createRefund(input: CreateRefundInput): Promise<CreateRefundResult>;
  parseWebhook(
    payload: unknown,
    headers: Record<string, string | string[] | undefined>,
  ): Promise<ParsedPaymentWebhook | null>;
}
