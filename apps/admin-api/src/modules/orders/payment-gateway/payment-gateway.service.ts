import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@repo/database';
import { PrismaService } from '../../../core/prisma/prisma.service.js';
import { OrderStatus, PaymentStatus } from '@repo/types';
import { MockPaymentGatewayProvider } from './mock-payment-gateway.provider.js';
import { OmisePaymentGatewayProvider } from './omise-payment-gateway.provider.js';
import type {
  IPaymentGatewayProvider,
  CreatePaymentIntentInput,
  CreatePaymentIntentResult,
  CreateRefundInput,
  CreateRefundResult,
} from './payment-gateway.interface.js';

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);
  private activeProvider: IPaymentGatewayProvider;

  constructor(
    private readonly mockProvider: MockPaymentGatewayProvider,
    private readonly omiseProvider: OmisePaymentGatewayProvider,
    private readonly prisma: PrismaService,
  ) {
    const providerName = process.env.PAYMENT_GATEWAY_PROVIDER ?? 'mock';

    if (providerName.toLowerCase() === 'omise') {
      this.activeProvider = this.omiseProvider;
      this.logger.log(
        'Payment Gateway Service initialized with OMISE Provider',
      );
    } else {
      this.activeProvider = this.mockProvider;
      this.logger.log('Payment Gateway Service initialized with Mock Provider');
    }
  }

  getActiveProviderName(): string {
    return this.activeProvider.providerName;
  }

  async createPaymentIntent(
    input: CreatePaymentIntentInput,
  ): Promise<CreatePaymentIntentResult> {
    return this.activeProvider.createPaymentIntent(input);
  }

  async checkPaymentStatus(
    transactionReference: string,
  ): Promise<PaymentStatus> {
    return this.activeProvider.checkPaymentStatus(transactionReference);
  }

  async createRefund(input: CreateRefundInput): Promise<CreateRefundResult> {
    return this.activeProvider.createRefund(input);
  }

  async handleWebhook(
    payload: unknown,
    headers: Record<string, string | string[] | undefined> = {},
  ): Promise<{ success: boolean; message: string }> {
    const parsed = await this.activeProvider.parseWebhook(payload, headers);
    if (!parsed) {
      return {
        success: false,
        message: 'Invalid or unsupported payment webhook payload',
      };
    }

    const payment = await this.prisma.payment.findFirst({
      where: {
        OR: [
          { transactionReference: parsed.transactionReference },
          { id: parsed.transactionReference },
        ],
      },
      include: { order: true },
    });

    if (!payment) {
      this.logger.warn(
        `Payment webhook received for unknown reference: ${parsed.transactionReference}`,
      );
      return { success: false, message: 'Payment reference not found' };
    }

    // Deduplication check: Avoid processing the exact same webhook event twice
    if (payment.gatewayEventId === parsed.gatewayEventId) {
      return { success: true, message: 'Duplicate payment event skipped' };
    }

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: parsed.paymentStatus,
          gatewayEventId: parsed.gatewayEventId,
          paidAt: parsed.paidAt ?? new Date(),
          cardLast4: parsed.cardLast4 ?? payment.cardLast4,
          cardBrand: parsed.cardBrand ?? payment.cardBrand,
        },
      });

      if (parsed.isSuccessful) {
        const nextOrderStatus = payment.order.hasPreorderItems
          ? OrderStatus.PREORDER_AWAITING_STOCK
          : OrderStatus.PAID;

        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: nextOrderStatus },
        });
      }
    });

    return { success: true, message: 'Payment webhook processed successfully' };
  }
}
